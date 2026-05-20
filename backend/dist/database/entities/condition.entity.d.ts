import { Deal } from './deal.entity';
import { User } from './user.entity';
export declare enum ConditionType {
    BOOLEAN_FLAG = "BOOLEAN_FLAG",
    DATE_DEADLINE = "DATE_DEADLINE",
    DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD",
    EXTERNAL_CONFIRMATION = "EXTERNAL_CONFIRMATION",
    APPROVAL = "APPROVAL"
}
export declare enum ConditionStatus {
    PENDING = "PENDING",
    MET = "MET",
    WAIVED = "WAIVED",
    FAILED = "FAILED"
}
export declare class Condition {
    id: string;
    deal: Deal;
    name: string;
    description: string;
    conditionType: ConditionType;
    ruleJson: Record<string, any>;
    status: ConditionStatus;
    assignedToRole: string;
    evidenceDocId: string;
    waivedBy: User;
    waivedReason: string;
    metAt: Date;
    evaluatedAt: Date;
    dueDate: Date;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
}
