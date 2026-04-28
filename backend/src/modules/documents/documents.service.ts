import {
  Injectable, NotFoundException, ForbiddenException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';
import { Document, DocType } from '../../database/entities/document.entity';
import { Deal } from '../../database/entities/deal.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { ActivityService } from '../audit/activity.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { ActivityEventType } from '../../database/entities/activity.entity';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    @InjectRepository(Document) private readonly docsRepo: Repository<Document>,
    @InjectRepository(Deal) private readonly dealsRepo: Repository<Deal>,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
    private readonly gateway: WebsocketsGateway,
  ) {
    this.s3 = new S3Client({
      region: config.get('AWS_REGION', 'ap-southeast-2'),
      credentials: config.get('NODE_ENV') !== 'development' ? {
        accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
      } : undefined,
    });
    this.bucket = config.get('S3_BUCKET_NAME', 'settlement-os-documents');
  }

  async upload(
    dealId: string,
    file: Express.Multer.File,
    docType: DocType,
    name: string,
    uploader: User,
  ): Promise<Document> {
    const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('Deal not found');

    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const s3Key = `deals/${dealId}/${Date.now()}-${file.originalname}`;

    if (this.config.get('NODE_ENV') !== 'development') {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
          ServerSideEncryption: 'AES256',
          Metadata: {
            dealId,
            uploadedBy: uploader.id,
            docType,
          },
        }),
      );
    } else {
      this.logger.log(`[Mock S3] Would upload ${s3Key} (${file.size} bytes)`);
    }

    const doc = this.docsRepo.create({
      deal,
      uploadedBy: uploader,
      name,
      originalFilename: file.originalname,
      docType,
      s3Bucket: this.bucket,
      s3Key,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      checksumSha256: checksum,
    });
    await this.docsRepo.save(doc);

    await this.activityService.log({
      dealId, userId: uploader.id, actorRole: uploader.role,
      eventType: ActivityEventType.DOCUMENT_UPLOADED,
      message: `${uploader.fullName} uploaded "${name}" (${docType})`,
    });

    await this.auditService.log({
      dealId, userId: uploader.id, action: 'DOCUMENT_UPLOADED',
      entityType: 'document', entityId: doc.id,
      newValue: { name, docType, s3Key },
    });

    this.gateway.emitToDeal(dealId, 'document:uploaded', { dealId, documentId: doc.id, name, docType });
    return doc;
  }

  async findByDeal(dealId: string): Promise<(Document & { downloadUrl: string })[]> {
    const docs = await this.docsRepo.find({
      where: { deal: { id: dealId }, deletedAt: null as any },
      relations: ['uploadedBy', 'verifiedBy'],
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      docs.map(async (doc) => ({
        ...doc,
        downloadUrl: await this.getPresignedUrl(doc.s3Key),
      })),
    );
  }

  async verify(dealId: string, docId: string, verifier: User): Promise<Document> {
    if (![UserRole.BUYER_CONVEYANCER, UserRole.SELLER_CONVEYANCER, UserRole.ADMIN].includes(verifier.role)) {
      throw new ForbiddenException('Only conveyancers can verify documents');
    }
    const doc = await this.docsRepo.findOne({
      where: { id: docId, deal: { id: dealId } },
    });
    if (!doc) throw new NotFoundException('Document not found');
    doc.verified = true;
    doc.verifiedBy = verifier;
    doc.verifiedAt = new Date();
    await this.docsRepo.save(doc);

    await this.activityService.log({
      dealId, userId: verifier.id, actorRole: verifier.role,
      eventType: ActivityEventType.DOCUMENT_VERIFIED,
      message: `${verifier.fullName} verified document "${doc.name}"`,
    });

    this.gateway.emitToDeal(dealId, 'document:verified', { dealId, documentId: doc.id });
    return doc;
  }

  async softDelete(dealId: string, docId: string, user: User) {
    const doc = await this.docsRepo.findOne({
      where: { id: docId, deal: { id: dealId } },
    });
    if (!doc) throw new NotFoundException('Document not found');
    doc.deletedAt = new Date();
    await this.docsRepo.save(doc);
  }

  private async getPresignedUrl(s3Key: string): Promise<string> {
    if (this.config.get('NODE_ENV') === 'development') {
      return `http://localhost:3001/mock-s3/${s3Key}`;
    }
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
    return getSignedUrl(this.s3, command, {
      expiresIn: this.config.get<number>('S3_PRESIGNED_URL_EXPIRES', 3600),
    });
  }
}
