import { Repository } from 'typeorm';
import { Condition } from '../../database/entities/condition.entity';
import { Document } from '../../database/entities/document.entity';
export interface EvaluationResult {
    conditionId: string;
    name: string;
    passed: boolean;
    reason?: string;
}
export interface SettlementGateResult {
    dealId: string;
    settlementAllowed: boolean;
    conditions: EvaluationResult[];
    blockers: string[];
}
export declare class ConditionEngineService {
    private readonly conditionsRepo;
    private readonly documentsRepo;
    private readonly logger;
    constructor(conditionsRepo: Repository<Condition>, documentsRepo: Repository<Document>);
    evaluateDeal(dealId: string): Promise<SettlementGateResult>;
    evaluateCondition(condition: Condition, dealId: string): Promise<EvaluationResult>;
    private evaluateBooleanFlag;
    private evaluateDateDeadline;
    private evaluateDocumentUpload;
    private evaluateExternalConfirmation;
    private evaluateApproval;
}
