import { Repository } from 'typeorm';
import { Condition, ConditionType, ConditionStatus } from '../../database/entities/condition.entity';
import { Deal } from '../../database/entities/deal.entity';
import { User } from '../../database/entities/user.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { AuditService } from '../audit/audit.service';
import { ActivityService } from '../audit/activity.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { ConditionEngineService } from './condition-engine.service';
export declare class CreateConditionDto {
    name: string;
    description?: string;
    conditionType: ConditionType;
    ruleJson: Record<string, any>;
    assignedToRole?: string;
    dueDate?: string;
}
export declare class UpdateConditionDto {
    status?: ConditionStatus;
    evidenceDocId?: string;
    waivedReason?: string;
    notes?: string;
}
export declare class ConditionsService {
    private readonly conditionsRepo;
    private readonly dealsRepo;
    private readonly partiesRepo;
    private readonly engine;
    private readonly auditService;
    private readonly activityService;
    private readonly gateway;
    constructor(conditionsRepo: Repository<Condition>, dealsRepo: Repository<Deal>, partiesRepo: Repository<DealParty>, engine: ConditionEngineService, auditService: AuditService, activityService: ActivityService, gateway: WebsocketsGateway);
    create(dealId: string, dto: CreateConditionDto, user: User): Promise<Condition>;
    findByDeal(dealId: string): Promise<Condition[]>;
    update(dealId: string, conditionId: string, dto: UpdateConditionDto, user: User): Promise<Condition>;
    evaluate(dealId: string): Promise<import("./condition-engine.service").SettlementGateResult>;
    private assertCanMarkMet;
}
