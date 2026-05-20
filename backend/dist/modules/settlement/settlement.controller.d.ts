import { User } from '../../database/entities/user.entity';
import { SettlementService, InitiateSettlementDto } from './settlement.service';
declare class ApproveSettlementDto {
    notes?: string;
}
export declare class SettlementController {
    private readonly settlementService;
    constructor(settlementService: SettlementService);
    validate(dealId: string): Promise<{
        canSettle: boolean;
        checks: {
            allConditionsMet: boolean;
            depositConfirmed: boolean;
            settlementDateReached: boolean;
            dealStatus: import("../../database/entities/deal.entity").DealStatus;
        };
        blockers: string[];
        conditions: import("../conditions/condition-engine.service").EvaluationResult[];
    }>;
    approve(dealId: string, dto: ApproveSettlementDto, user: User): Promise<{
        dealId: string;
        status: import("../../database/entities/deal.entity").DealStatus;
        approvedBy: string;
        approvedAt: Date;
    }>;
    execute(dealId: string, dto: InitiateSettlementDto, user: User): Promise<{
        executionId: string;
        status: string;
        message: string;
    }>;
    getExecution(dealId: string): Promise<import("../../database/entities/settlement-execution.entity").SettlementExecution | null>;
}
export {};
