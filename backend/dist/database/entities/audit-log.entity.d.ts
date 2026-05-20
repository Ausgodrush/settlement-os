import { Deal } from './deal.entity';
import { User } from './user.entity';
export declare class AuditLog {
    id: number;
    deal: Deal;
    user: User;
    action: string;
    entityType: string;
    entityId: string;
    oldValue: Record<string, any>;
    newValue: Record<string, any>;
    metadata: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: Date;
}
