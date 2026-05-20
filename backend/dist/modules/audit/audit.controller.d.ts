import { AuditService } from './audit.service';
import { ActivityService } from './activity.service';
import { User } from '../../database/entities/user.entity';
declare class AddCommentDto {
    message: string;
}
export declare class AuditController {
    private readonly auditService;
    private readonly activityService;
    constructor(auditService: AuditService, activityService: ActivityService);
    getAuditLog(dealId: string): Promise<import("../../database/entities/audit-log.entity").AuditLog[]>;
    getActivities(dealId: string, limit?: number): Promise<import("../../database/entities/activity.entity").Activity[]>;
    addComment(dealId: string, dto: AddCommentDto, user: User): Promise<import("../../database/entities/activity.entity").Activity>;
}
export {};
