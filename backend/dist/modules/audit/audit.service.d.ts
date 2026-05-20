import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';
export interface LogAuditDto {
    dealId?: string;
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    oldValue?: Record<string, any>;
    newValue?: Record<string, any>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
}
export declare class AuditService {
    private readonly auditRepo;
    constructor(auditRepo: Repository<AuditLog>);
    log(dto: LogAuditDto): Promise<void>;
    findByDeal(dealId: string, limit?: number): Promise<AuditLog[]>;
}
