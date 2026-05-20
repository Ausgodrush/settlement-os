import { Deal } from './deal.entity';
import { User } from './user.entity';
export declare enum MilestoneType {
    CONTRACT_SIGNED = "CONTRACT_SIGNED",
    DEPOSIT_PAID = "DEPOSIT_PAID",
    FINANCE_APPROVED = "FINANCE_APPROVED",
    INSPECTION_COMPLETE = "INSPECTION_COMPLETE",
    TITLE_CHECKED = "TITLE_CHECKED",
    DOCUMENTS_VERIFIED = "DOCUMENTS_VERIFIED",
    SETTLEMENT_BOOKED = "SETTLEMENT_BOOKED",
    KEYS_RELEASED = "KEYS_RELEASED",
    SETTLED = "SETTLED",
    CUSTOM = "CUSTOM"
}
export declare enum MilestoneStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETE = "COMPLETE",
    BLOCKED = "BLOCKED"
}
export declare class Milestone {
    id: string;
    deal: Deal;
    name: string;
    milestoneType: MilestoneType;
    status: MilestoneStatus;
    dueDate: Date;
    completedAt: Date;
    completedBy: User;
    assignedToRole: string;
    notes: string;
    displayOrder: number;
    createdAt: Date;
}
