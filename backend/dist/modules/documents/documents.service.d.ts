import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Document, DocType } from '../../database/entities/document.entity';
import { Deal } from '../../database/entities/deal.entity';
import { User } from '../../database/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { ActivityService } from '../audit/activity.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
export declare class DocumentsService {
    private readonly docsRepo;
    private readonly dealsRepo;
    private readonly config;
    private readonly auditService;
    private readonly activityService;
    private readonly gateway;
    private readonly logger;
    private readonly s3;
    private readonly bucket;
    constructor(docsRepo: Repository<Document>, dealsRepo: Repository<Deal>, config: ConfigService, auditService: AuditService, activityService: ActivityService, gateway: WebsocketsGateway);
    upload(dealId: string, file: Express.Multer.File, docType: DocType, name: string, uploader: User): Promise<Document>;
    findByDeal(dealId: string): Promise<(Document & {
        downloadUrl: string;
    })[]>;
    verify(dealId: string, docId: string, verifier: User): Promise<Document>;
    softDelete(dealId: string, docId: string, user: User): Promise<void>;
    private getPresignedUrl;
}
