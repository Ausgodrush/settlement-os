import { Repository } from 'typeorm';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { SettlementExecution } from '../../database/entities/settlement-execution.entity';
import { User } from '../../database/entities/user.entity';
import { ConditionEngineService } from '../conditions/condition-engine.service';
import { AuditService } from '../audit/audit.service';
import { ActivityService } from '../audit/activity.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { PexaService } from '../integrations/pexa.service';
export declare class InitiateSettlementDto {
    pexaWorkspaceId?: string;
    notes?: string;
}
export declare class SettlementService {
    private readonly dealsRepo;
    private readonly partiesRepo;
    private readonly executionRepo;
    private readonly conditionEngine;
    private readonly auditService;
    private readonly activityService;
    private readonly gateway;
    private readonly notifications;
    private readonly pexaService;
    private readonly logger;
    constructor(dealsRepo: Repository<Deal>, partiesRepo: Repository<DealParty>, executionRepo: Repository<SettlementExecution>, conditionEngine: ConditionEngineService, auditService: AuditService, activityService: ActivityService, gateway: WebsocketsGateway, notifications: NotificationsService, pexaService: PexaService);
    validate(dealId: string): Promise<{
        canSettle: boolean;
        checks: {
            allConditionsMet: boolean;
            depositConfirmed: boolean;
            settlementDateReached: boolean;
            dealStatus: DealStatus;
        };
        blockers: string[];
        conditions: import("../conditions/condition-engine.service").EvaluationResult[];
    }>;
    approveForSettlement(dealId: string, user: User, notes?: string): Promise<{
        dealId: string;
        status: DealStatus;
        approvedBy: string;
        approvedAt: Date;
    }>;
    execute(dealId: string, user: User, dto: InitiateSettlementDto): Promise<{
        executionId: string;
        status: string;
        message: string;
    }>;
    private runSettlementFlow;
    getExecution(dealId: string): Promise<SettlementExecution | null>;
    private getDeal;
    private sleep;
}
