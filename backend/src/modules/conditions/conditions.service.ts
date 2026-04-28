import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Condition, ConditionType, ConditionStatus } from '../../database/entities/condition.entity';
import { Deal } from '../../database/entities/deal.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { AuditService } from '../audit/audit.service';
import { ActivityService } from '../audit/activity.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { ConditionEngineService } from './condition-engine.service';

export class CreateConditionDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: ConditionType }) @IsEnum(ConditionType) conditionType: ConditionType;
  @ApiProperty() ruleJson: Record<string, any>;
  @ApiProperty({ required: false }) @IsOptional() @IsString() assignedToRole?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() dueDate?: string;
}

export class UpdateConditionDto {
  @IsOptional() @IsEnum(ConditionStatus) status?: ConditionStatus;
  @IsOptional() @IsUUID() evidenceDocId?: string;
  @IsOptional() @IsString() waivedReason?: string;
  @IsOptional() @IsString() notes?: string;
}

@Injectable()
export class ConditionsService {
  constructor(
    @InjectRepository(Condition) private readonly conditionsRepo: Repository<Condition>,
    @InjectRepository(Deal) private readonly dealsRepo: Repository<Deal>,
    @InjectRepository(DealParty) private readonly partiesRepo: Repository<DealParty>,
    private readonly engine: ConditionEngineService,
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
    private readonly gateway: WebsocketsGateway,
  ) {}

  async create(dealId: string, dto: CreateConditionDto, user: User): Promise<Condition> {
    const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
    if (!deal) throw new NotFoundException('Deal not found');

    const count = await this.conditionsRepo.count({ where: { deal: { id: dealId } } });
    const condition = this.conditionsRepo.create({
      ...dto,
      deal,
      status: ConditionStatus.PENDING,
      displayOrder: count + 1,
    });
    await this.conditionsRepo.save(condition);
    await this.auditService.log({
      dealId, userId: user.id, action: 'CONDITION_CREATED',
      entityType: 'condition', entityId: condition.id, newValue: dto,
    });
    return condition;
  }

  async findByDeal(dealId: string): Promise<Condition[]> {
    return this.conditionsRepo.find({
      where: { deal: { id: dealId } },
      order: { displayOrder: 'ASC' },
    });
  }

  async update(dealId: string, conditionId: string, dto: UpdateConditionDto, user: User): Promise<Condition> {
    const condition = await this.conditionsRepo.findOne({
      where: { id: conditionId, deal: { id: dealId } },
    });
    if (!condition) throw new NotFoundException('Condition not found');

    const oldStatus = condition.status;

    if (dto.status === ConditionStatus.MET) {
      this.assertCanMarkMet(condition, user);
      condition.status = ConditionStatus.MET;
      condition.metAt = new Date();
      if (dto.evidenceDocId) condition.evidenceDocId = dto.evidenceDocId;
    } else if (dto.status === ConditionStatus.WAIVED) {
      if (![UserRole.BUYER_CONVEYANCER, UserRole.SELLER_CONVEYANCER, UserRole.ADMIN].includes(user.role)) {
        throw new ForbiddenException('Only conveyancers can waive conditions');
      }
      condition.status = ConditionStatus.WAIVED;
      condition.waivedBy = user;
      condition.waivedReason = dto.waivedReason;
    }

    condition.evaluatedAt = new Date();
    await this.conditionsRepo.save(condition);

    if (oldStatus !== condition.status) {
      const eventType = condition.status === ConditionStatus.MET
        ? 'CONDITION_MET' : 'CONDITION_WAIVED';
      await this.activityService.log({
        dealId, userId: user.id, eventType: eventType as any,
        message: `${user.fullName} marked "${condition.name}" as ${condition.status}`,
      });
      this.gateway.emitToDeal(dealId, 'condition:updated', {
        dealId, conditionId, status: condition.status,
      });
    }

    return condition;
  }

  async evaluate(dealId: string) {
    return this.engine.evaluateDeal(dealId);
  }

  private assertCanMarkMet(condition: Condition, user: User) {
    if (user.role === UserRole.ADMIN) return;
    if (!condition.assignedToRole) return;
    // Map condition role to user role
    const allowed = condition.assignedToRole.toLowerCase().includes('conveyancer')
      ? [UserRole.BUYER_CONVEYANCER, UserRole.SELLER_CONVEYANCER]
      : condition.assignedToRole.toLowerCase().includes('buyer')
      ? [UserRole.BUYER, UserRole.BUYER_CONVEYANCER]
      : condition.assignedToRole.toLowerCase().includes('seller')
      ? [UserRole.SELLER, UserRole.SELLER_CONVEYANCER]
      : Object.values(UserRole);

    if (!allowed.includes(user.role)) {
      throw new ForbiddenException(`Only ${condition.assignedToRole} can mark this condition as met`);
    }
  }
}
