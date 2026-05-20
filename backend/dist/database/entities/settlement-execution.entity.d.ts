import { Deal } from './deal.entity';
import { User } from './user.entity';
export declare enum ExecutionStatus {
    PENDING = "PENDING",
    VALIDATING = "VALIDATING",
    APPROVED = "APPROVED",
    EXECUTING = "EXECUTING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED"
}
export declare class SettlementExecution {
    id: string;
    deal: Deal;
    status: ExecutionStatus;
    initiatedBy: User;
    validatedAt: Date;
    validationResult: Record<string, any>;
    pexaWorkspaceId: string;
    pexaLodgementRef: string;
    pexaTriggeredAt: Date;
    escrowReleased: boolean;
    escrowReleasedAt: Date;
    escrowTxHash: string;
    completedAt: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
