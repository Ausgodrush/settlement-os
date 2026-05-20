"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var DocumentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const document_entity_1 = require("../../database/entities/document.entity");
const deal_entity_1 = require("../../database/entities/deal.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const audit_service_1 = require("../audit/audit.service");
const activity_service_1 = require("../audit/activity.service");
const websockets_gateway_1 = require("../websockets/websockets.gateway");
const activity_entity_1 = require("../../database/entities/activity.entity");
let DocumentsService = DocumentsService_1 = class DocumentsService {
    constructor(docsRepo, dealsRepo, config, auditService, activityService, gateway) {
        this.docsRepo = docsRepo;
        this.dealsRepo = dealsRepo;
        this.config = config;
        this.auditService = auditService;
        this.activityService = activityService;
        this.gateway = gateway;
        this.logger = new common_1.Logger(DocumentsService_1.name);
        this.s3 = new client_s3_1.S3Client({
            region: config.get('AWS_REGION') ?? 'ap-southeast-2',
            credentials: config.get('NODE_ENV') !== 'development' ? {
                accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
                secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
            } : undefined,
        });
        this.bucket = config.get('S3_BUCKET_NAME') ?? 'settlement-os-documents';
    }
    async upload(dealId, file, docType, name, uploader) {
        const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
        if (!deal)
            throw new common_1.NotFoundException('Deal not found');
        const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
        const s3Key = `deals/${dealId}/${Date.now()}-${file.originalname}`;
        if (this.config.get('NODE_ENV') !== 'development') {
            await this.s3.send(new client_s3_1.PutObjectCommand({
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
            }));
        }
        else {
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
            eventType: activity_entity_1.ActivityEventType.DOCUMENT_UPLOADED,
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
    async findByDeal(dealId) {
        const docs = await this.docsRepo.find({
            where: { deal: { id: dealId }, deletedAt: null },
            relations: ['uploadedBy', 'verifiedBy'],
            order: { createdAt: 'DESC' },
        });
        return Promise.all(docs.map(async (doc) => ({
            ...doc,
            downloadUrl: await this.getPresignedUrl(doc.s3Key),
        })));
    }
    async verify(dealId, docId, verifier) {
        if (![user_entity_1.UserRole.BUYER_CONVEYANCER, user_entity_1.UserRole.SELLER_CONVEYANCER, user_entity_1.UserRole.ADMIN].includes(verifier.role)) {
            throw new common_1.ForbiddenException('Only conveyancers can verify documents');
        }
        const doc = await this.docsRepo.findOne({
            where: { id: docId, deal: { id: dealId } },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        doc.verified = true;
        doc.verifiedBy = verifier;
        doc.verifiedAt = new Date();
        await this.docsRepo.save(doc);
        await this.activityService.log({
            dealId, userId: verifier.id, actorRole: verifier.role,
            eventType: activity_entity_1.ActivityEventType.DOCUMENT_VERIFIED,
            message: `${verifier.fullName} verified document "${doc.name}"`,
        });
        this.gateway.emitToDeal(dealId, 'document:verified', { dealId, documentId: doc.id });
        return doc;
    }
    async softDelete(dealId, docId, user) {
        const doc = await this.docsRepo.findOne({
            where: { id: docId, deal: { id: dealId } },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        doc.deletedAt = new Date();
        await this.docsRepo.save(doc);
    }
    async getPresignedUrl(s3Key) {
        if (this.config.get('NODE_ENV') === 'development') {
            return `http://localhost:3001/mock-s3/${s3Key}`;
        }
        const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucket, Key: s3Key });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, {
            expiresIn: this.config.get('S3_PRESIGNED_URL_EXPIRES', 3600),
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = DocumentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __param(1, (0, typeorm_1.InjectRepository)(deal_entity_1.Deal)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        audit_service_1.AuditService,
        activity_service_1.ActivityService,
        websockets_gateway_1.WebsocketsGateway])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map