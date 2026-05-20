import { Deal } from './deal.entity';
import { User } from './user.entity';
export declare enum ActivityEventType {
    COMMENT = "COMMENT",
    STATUS_CHANGED = "STATUS_CHANGED",
    CONDITION_MET = "CONDITION_MET",
    CONDITION_WAIVED = "CONDITION_WAIVED",
    DOCUMENT_UPLOADED = "DOCUMENT_UPLOADED",
    DOCUMENT_VERIFIED = "DOCUMENT_VERIFIED",
    PARTY_ADDED = "PARTY_ADDED",
    MILESTONE_COMPLETE = "MILESTONE_COMPLETE",
    SETTLEMENT_APPROVED = "SETTLEMENT_APPROVED",
    SETTLEMENT_EXECUTED = "SETTLEMENT_EXECUTED",
    SYSTEM = "SYSTEM"
}
export declare class Activity {
    id: string;
    deal: Deal;
    user: User;
    actorRole: string;
    eventType: ActivityEventType;
    message: string;
    metadata: Record<string, any>;
    isSystem: boolean;
    createdAt: Date;
}
