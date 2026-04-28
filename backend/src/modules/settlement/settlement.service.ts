import {
  Injectable, BadRequestException, NotFoundException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { SettlementExecution, ExecutionStatus } from '../../database/entities/settlement-execution.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { ConditionEngineService } from '../conditions/condition-engine.service';
import { AuditService } from '../audit/audit.service';
import { ActivityService } from '../audit/activity.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { PexaService } from '../integrations/pexa.service';
import { ActivityEventType } from '../../database/entities/activity.entity';

export class InitiateSettlementDto {
  pexaWorkspaceId?: string;
  notes?: string;
}

@Injectable()
export class SettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @InjectRepository(Deal) private readonly dealsRepo: Repository<Deal>,
    @InjectRepository(DealParty) private readonly partiesRepo: Repository<DealParty>,
    @InjectRepository(SettlementExecution) private readonly executionRepo: Repository<SettlementExecution>,
    private readonly conditionEngine: ConditionEngineService,
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
    private readonly gateway: WebsocketsGateway,
    private readonly notifications: NotificationsService,
    private readonly pexaService: PexaService,
  ) {}

  async validate(dealId: string) {
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
    if (!depositConfirmed) blockers.push('Deposit has not been confirmed as paid');

    const canSettle = engineResult.settlementAllowed && depositConfirmed;

    return { canSettle, checks, blockers, conditions: engineResult.conditions };
  }

  async approveForSettlement(dealId: string, user: User, notes?: string) {
    if (![UserRole.BUYER_CONVEYANCER, UserRole.SELLER_CONVEYANCER, UserRole.ADMIN].includes(user.role)) {
      throw new BadRequestException('Only conveyancers can approve settlement');
    }
    const deal = await this.getDeal(dealId);
    if (deal.status !== DealStatus.ACTIVE) {
      throw new BadRequestException(`Deal must be ACTIVE to approve settlement (current: ${deal.status})`);
    }

    const validation = await this.validate(dealId);
    if (!validation.canSettle) {
      throw new BadRequestException({
        message: 'Cannot approve: settlement conditions not met',
        blockers: validation.blockers,
      });
    }

    deal.status = DealStatus.READY;
    await this.dealsRepo.save(deal);

    await this.activityService.log({
      dealId, userId: user.id, actorRole: user.role,
      eventType: ActivityEventType.SETTLEMENT_APPROVED,
      message: `${user.fullName} approved deal for settlement${notes ? `: ${notes}` : ''}`,
    });

    await this.auditService.log({
      dealId, userId: user.id, action: 'SETTLEMENT_APPROVED',
      entityType: 'deal', entityId: dealId,
      newValue: { status: DealStatus.READY },
    });

    this.gateway.emitToDeal(dealId, 'deal:updated', { dealId, status: DealStatus.READY });

    return { dealId, status: DealStatus.READY, approvedBy: user.fullName, approvedAt: new Date() };
  }

  async execute(dealId: string, user: User, dto: InitiateSettlementDto) {
    if (![UserRole.BUYER_CONVEYANCER, UserRole.SELLER_CONVEYANCER, UserRole.ADMIN].includes(user.role)) {
      throw new BadRequestException('Only conveyancers can execute settlement');
    }

    const deal = await this.getDeal(dealId);
    if (deal.status !== DealStatus.READY) {
      throw new BadRequestException(`Deal must be READY for settlement (current: ${deal.status})`);
    }

    const existing = await this.executionRepo.findOne({ where: { deal: { id: dealId } } });
    if (existing && existing.status === ExecutionStatus.COMPLETED) {
      throw new BadRequestException('Deal has already been settled');
    }

    // Final validation gate
    const validation = await this.validate(dealId);
    if (!validation.canSettle) {
      throw new BadRequestException({
        message: 'Cannot execute settlement',
        blockers: validation.blockers,
      });
    }

    // Create or update execution record
    const execution = existing || this.executionRepo.create({ deal: { id: dealId } as any });
    execution.status = ExecutionStatus.EXECUTING;
    execution.initiatedBy = user;
    execution.validatedAt = new Date();
    execution.validationResult = validation;
    if (dto.pexaWorkspaceId) execution.pexaWorkspaceId = dto.pexaWorkspaceId;
    await this.executionRepo.save(execution);

    this.gateway.emitToDeal(dealId, 'settlement:status', { dealId, executionStatus: 'EXECUTING' });

    // Run settlement async (don't block the HTTP response)
    this.runSettlementFlow(deal, execution, user).catch((err) => {
      this.logger.error(`Settlement flow failed for deal ${dealId}: ${err.message}`);
    });

    return { executionId: execution.id, status: 'EXECUTING', message: 'Settlement initiated' };
  }

  private async runSettlementFlow(deal: Deal, execution: SettlementExecution, actor: User) {
    try {
      // Step 1: Simulate escrow release
      this.logger.log(`[Settlement] Releasing escrow for deal ${deal.id}`);
      await this.sleep(1000);
      execution.escrowReleased = true;
      execution.escrowReleasedAt = new Date();
      await this.executionRepo.save(execution);

      // Step 2: Trigger PEXA
      this.logger.log(`[Settlement] Triggering PEXA for deal ${deal.id}`);
      const pexaResult = await this.pexaService.triggerSettlement({
        workspaceId: execution.pexaWorkspaceId || `WS-${deal.referenceNo}`,
        dealReference: deal.referenceNo,
      });
      execution.pexaLodgementRef = pexaResult.lodgementRef;
      execution.pexaTriggeredAt = new Date();
      await this.executionRepo.save(execution);

      // Step 3: Mark deal settled
      deal.status = DealStatus.SETTLED;
      deal.actualSettledAt = new Date();
      if (pexaResult.workspaceId) deal.pexaWorkspaceId = pexaResult.workspaceId;
      await this.dealsRepo.save(deal);

      execution.status = ExecutionStatus.COMPLETED;
      execution.completedAt = new Date();
      await this.executionRepo.save(execution);

      await this.activityService.log({
        dealId: deal.id, userId: actor.id, actorRole: actor.role,
        eventType: ActivityEventType.SETTLEMENT_EXECUTED,
        message: `Settlement completed. PEXA lodgement ref: ${pexaResult.lodgementRef}`,
        isSystem: false,
      });

      await this.auditService.log({
        dealId: deal.id, userId: actor.id, action: 'SETTLEMENT_COMPLETED',
        entityType: 'deal', entityId: deal.id,
        newValue: { status: DealStatus.SETTLED, pexaLodgementRef: pexaResult.lodgementRef },
      });

      this.gateway.emitToDeal(deal.id, 'settlement:status', { dealId: deal.id, executionStatus: 'COMPLETED' });
      this.gateway.emitToDeal(deal.id, 'deal:updated', { dealId: deal.id, status: DealStatus.SETTLED });

      await this.notifications.notifyDealParties(deal.id, {
        title: 'Settlement Complete',
        message: `Property at ${deal.propertyAddress} has settled. PEXA ref: ${pexaResult.lodgementRef}`,
      });
    } catch (err) {
      execution.status = ExecutionStatus.FAILED;
      execution.notes = err.message;
      await this.executionRepo.save(execution);
      this.gateway.emitToDeal(deal.id, 'settlement:status', {
        dealId: deal.id, executionStatus: 'FAILED', error: err.message,
      });
      throw err;
    }
  }

  async getExecution(dealId: string) {
    return this.executionRepo.findOne({
      where: { deal: { id: dealId } },
      relations: ['initiatedBy'],
    });
  }

  private async getDeal(dealId: string): Promise<Deal> {
    const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  private sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}
