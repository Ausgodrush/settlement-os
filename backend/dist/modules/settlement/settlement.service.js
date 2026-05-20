"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SettlementService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementService = exports.InitiateSettlementDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const deal_entity_1 = require("../../database/entities/deal.entity");
const deal_party_entity_1 = require("../../database/entities/deal-party.entity");
const settlement_execution_entity_1 = require("../../database/entities/settlement-execution.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const condition_engine_service_1 = require("../conditions/condition-engine.service");
const audit_service_1 = require("../audit/audit.service");
const activity_service_1 = require("../audit/activity.service");
const websockets_gateway_1 = require("../websockets/websockets.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
const pexa_service_1 = require("../integrations/pexa.service");
const activity_entity_1 = require("../../database/entities/activity.entity");
class InitiateSettlementDto {
}
exports.InitiateSettlementDto = InitiateSettlementDto;
let SettlementService = SettlementService_1 = class SettlementService {
    constructor(dealsRepo, partiesRepo, executionRepo, conditionEngine, auditService, activityService, gateway, notifications, pexaService) {
        this.dealsRepo = dealsRepo;
        this.partiesRepo = partiesRepo;
        this.executionRepo = executionRepo;
        this.conditionEngine = conditionEngine;
        this.auditService = auditService;
        this.activityService = activityService;
        this.gateway = gateway;
        this.notifications = notifications;
        this.pexaService = pexaService;
        this.logger = new common_1.Logger(SettlementService_1.name);
    }
    async validate(dealId) {
        const deal = await this.getDeal(dealId);
        const engineResult = await this.conditionEngine.evaluateDeal(dealId);
        const depositConfirmed = deal.depositPaid;
        const settlementDateReached = deal.settlementDate
            ? new Date() >= new Date(deal.settlementDate)
            : false;
        const checks = {
            allConditionsMet: engineResult.settlementAllowed,
            depositConfirmed,
            settlementDateReached,
            dealStatus: deal.status,
        };
        const blockers = [...engineResult.blockers];
        if (!depositConfirmed)
            blockers.push('Deposit has not been confirmed as paid');
        const canSettle = engineResult.settlementAllowed && depositConfirmed;
        return { canSettle, checks, blockers, conditions: engineResult.conditions };
    }
    async approveForSettlement(dealId, user, notes) {
        if (![user_entity_1.UserRole.BUYER_CONVEYANCER, user_entity_1.UserRole.SELLER_CONVEYANCER, user_entity_1.UserRole.ADMIN].includes(user.role)) {
            throw new common_1.BadRequestException('Only conveyancers can approve settlement');
        }
        const deal = await this.getDeal(dealId);
        if (deal.status !== deal_entity_1.DealStatus.ACTIVE) {
            throw new common_1.BadRequestException(`Deal must be ACTIVE to approve settlement (current: ${deal.status})`);
        }
        const validation = await this.validate(dealId);
        if (!validation.canSettle) {
            throw new common_1.BadRequestException({
                message: 'Cannot approve: settlement conditions not met',
                blockers: validation.blockers,
            });
        }
        deal.status = deal_entity_1.DealStatus.READY;
        await this.dealsRepo.save(deal);
        await this.activityService.log({
            dealId, userId: user.id, actorRole: user.role,
            eventType: activity_entity_1.ActivityEventType.SETTLEMENT_APPROVED,
            message: `${user.fullName} approved deal for settlement${notes ? `: ${notes}` : ''}`,
        });
        await this.auditService.log({
            dealId, userId: user.id, action: 'SETTLEMENT_APPROVED',
            entityType: 'deal', entityId: dealId,
            newValue: { status: deal_entity_1.DealStatus.READY },
        });
        this.gateway.emitToDeal(dealId, 'deal:updated', { dealId, status: deal_entity_1.DealStatus.READY });
        return { dealId, status: deal_entity_1.DealStatus.READY, approvedBy: user.fullName, approvedAt: new Date() };
    }
    async execute(dealId, user, dto) {
        if (![user_entity_1.UserRole.BUYER_CONVEYANCER, user_entity_1.UserRole.SELLER_CONVEYANCER, user_entity_1.UserRole.ADMIN].includes(user.role)) {
            throw new common_1.BadRequestException('Only conveyancers can execute settlement');
        }
        const deal = await this.getDeal(dealId);
        if (deal.status !== deal_entity_1.DealStatus.READY) {
            throw new common_1.BadRequestException(`Deal must be READY for settlement (current: ${deal.status})`);
        }
        const existing = await this.executionRepo.findOne({ where: { deal: { id: dealId } } });
        if (existing && existing.status === settlement_execution_entity_1.ExecutionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Deal has already been settled');
        }
        const validation = await this.validate(dealId);
        if (!validation.canSettle) {
            throw new common_1.BadRequestException({
                message: 'Cannot execute settlement',
                blockers: validation.blockers,
            });
        }
        const execution = existing || this.executionRepo.create({ deal: { id: dealId } });
        execution.status = settlement_execution_entity_1.ExecutionStatus.EXECUTING;
        execution.initiatedBy = user;
        execution.validatedAt = new Date();
        execution.validationResult = validation;
        if (dto.pexaWorkspaceId)
            execution.pexaWorkspaceId = dto.pexaWorkspaceId;
        await this.executionRepo.save(execution);
        this.gateway.emitToDeal(dealId, 'settlement:status', { dealId, executionStatus: 'EXECUTING' });
        this.runSettlementFlow(deal, execution, user).catch((err) => {
            this.logger.error(`Settlement flow failed for deal ${dealId}: ${err.message}`);
        });
        return { executionId: execution.id, status: 'EXECUTING', message: 'Settlement initiated' };
    }
    async runSettlementFlow(deal, execution, actor) {
        try {
            this.logger.log(`[Settlement] Releasing escrow for deal ${deal.id}`);
            await this.sleep(1000);
            execution.escrowReleased = true;
            execution.escrowReleasedAt = new Date();
            await this.executionRepo.save(execution);
            this.logger.log(`[Settlement] Triggering PEXA for deal ${deal.id}`);
            const pexaResult = await this.pexaService.triggerSettlement({
                workspaceId: execution.pexaWorkspaceId || `WS-${deal.referenceNo}`,
                dealReference: deal.referenceNo,
            });
            execution.pexaLodgementRef = pexaResult.lodgementRef;
            execution.pexaTriggeredAt = new Date();
            await this.executionRepo.save(execution);
            deal.status = deal_entity_1.DealStatus.SETTLED;
            deal.actualSettledAt = new Date();
            if (pexaResult.workspaceId)
                deal.pexaWorkspaceId = pexaResult.workspaceId;
            await this.dealsRepo.save(deal);
            execution.status = settlement_execution_entity_1.ExecutionStatus.COMPLETED;
            execution.completedAt = new Date();
            await this.executionRepo.save(execution);
            await this.activityService.log({
                dealId: deal.id, userId: actor.id, actorRole: actor.role,
                eventType: activity_entity_1.ActivityEventType.SETTLEMENT_EXECUTED,
                message: `Settlement completed. PEXA lodgement ref: ${pexaResult.lodgementRef}`,
                isSystem: false,
            });
            await this.auditService.log({
                dealId: deal.id, userId: actor.id, action: 'SETTLEMENT_COMPLETED',
                entityType: 'deal', entityId: deal.id,
                newValue: { status: deal_entity_1.DealStatus.SETTLED, pexaLodgementRef: pexaResult.lodgementRef },
            });
            this.gateway.emitToDeal(deal.id, 'settlement:status', { dealId: deal.id, executionStatus: 'COMPLETED' });
            this.gateway.emitToDeal(deal.id, 'deal:updated', { dealId: deal.id, status: deal_entity_1.DealStatus.SETTLED });
            await this.notifications.notifyDealParties(deal.id, {
                title: 'Settlement Complete',
                message: `Property at ${deal.propertyAddress} has settled. PEXA ref: ${pexaResult.lodgementRef}`,
            });
        }
        catch (err) {
            execution.status = settlement_execution_entity_1.ExecutionStatus.FAILED;
            execution.notes = err.message;
            await this.executionRepo.save(execution);
            this.gateway.emitToDeal(deal.id, 'settlement:status', {
                dealId: deal.id, executionStatus: 'FAILED', error: err.message,
            });
            throw err;
        }
    }
    async getExecution(dealId) {
        return this.executionRepo.findOne({
            where: { deal: { id: dealId } },
            relations: ['initiatedBy'],
        });
    }
    async getDeal(dealId) {
        const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
        if (!deal)
            throw new common_1.NotFoundException('Deal not found');
        return deal;
    }
    sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }
};
exports.SettlementService = SettlementService;
exports.SettlementService = SettlementService = SettlementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(deal_entity_1.Deal)),
    __param(1, (0, typeorm_1.InjectRepository)(deal_party_entity_1.DealParty)),
    __param(2, (0, typeorm_1.InjectRepository)(settlement_execution_entity_1.SettlementExecution)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        condition_engine_service_1.ConditionEngineService,
        audit_service_1.AuditService,
        activity_service_1.ActivityService,
        websockets_gateway_1.WebsocketsGateway,
        notifications_service_1.NotificationsService,
        pexa_service_1.PexaService])
], SettlementService);
//# sourceMappingURL=settlement.service.js.map