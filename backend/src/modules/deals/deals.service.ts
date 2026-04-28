import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { DealParty, PartyRole } from '../../database/entities/deal-party.entity';
import { Condition, ConditionStatus } from '../../database/entities/condition.entity';
import { Milestone, MilestoneType, MilestoneStatus } from '../../database/entities/milestone.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { AuditService } from '../audit/audit.service';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { ActivityService } from '../audit/activity.service';
import {
  CreateDealDto, UpdateDealDto, UpdateDealStatusDto, AddPartyDto, DealQueryDto,
} from './dto/deals.dto';

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Deal) private readonly dealsRepo: Repository<Deal>,
    @InjectRepository(DealParty) private readonly partiesRepo: Repository<DealParty>,
    @InjectRepository(Condition) private readonly conditionsRepo: Repository<Condition>,
    @InjectRepository(Milestone) private readonly milestonesRepo: Repository<Milestone>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
    private readonly gateway: WebsocketsGateway,
  ) {}

  async create(dto: CreateDealDto, creator: User): Promise<Deal> {
    const referenceNo = await this.generateReferenceNo();
    const deal = this.dealsRepo.create({
      ...dto,
      referenceNo,
      status: DealStatus.INIT,
      createdBy: creator,
    });
    await this.dealsRepo.save(deal);

    // Auto-add creator as appropriate party role
    const creatorPartyRole = this.roleToPartyRole(creator.role);
    if (creatorPartyRole) {
      await this.addParty(deal.id, { userId: creator.id, partyRole: creatorPartyRole }, creator);
    }

    await this.auditService.log({
      dealId: deal.id,
      userId: creator.id,
      action: 'DEAL_CREATED',
      entityType: 'deal',
      entityId: deal.id,
      newValue: { referenceNo, status: DealStatus.INIT },
    });

    return deal;
  }

  async findAll(query: DealQueryDto, user: User) {
    const qb = this.dealsRepo
      .createQueryBuilder('deal')
      .leftJoinAndSelect('deal.createdBy', 'createdBy');

    // Non-admins only see deals they are party to
    if (user.role !== UserRole.ADMIN) {
      qb.innerJoin(
        'deal_parties',
        'dp',
        'dp.deal_id = deal.id AND dp.user_id = :userId AND dp.is_active = true',
        { userId: user.id },
      );
    }

    if (query.status) qb.andWhere('deal.status = :status', { status: query.status });
    if (query.search) {
      qb.andWhere(
        '(deal.propertyAddress ILIKE :s OR deal.referenceNo ILIKE :s OR deal.propertySuburb ILIKE :s)',
        { s: `%${query.search}%` },
      );
    }

    const total = await qb.getCount();
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    qb.skip((page - 1) * limit).take(limit).orderBy('deal.settlementDate', 'ASC', 'NULLS LAST');

    const deals = await qb.getMany();

    const enriched = await Promise.all(
      deals.map(async (deal) => {
        const conditions = await this.conditionsRepo.find({ where: { deal: { id: deal.id } } });
        const parties = await this.partiesRepo.find({
          where: { deal: { id: deal.id }, isActive: true },
          relations: ['user'],
        });
        const daysToSettlement = deal.settlementDate
          ? Math.ceil((new Date(deal.settlementDate).getTime() - Date.now()) / 86400000)
          : null;
        return {
          ...deal,
          daysToSettlement,
          conditionsSummary: {
            total: conditions.length,
            met: conditions.filter((c) => c.status === ConditionStatus.MET).length,
            pending: conditions.filter((c) => c.status === ConditionStatus.PENDING).length,
          },
          parties: parties.map((p) => ({
            id: p.id,
            role: p.partyRole,
            user: { id: p.user.id, name: p.user.fullName, email: p.user.email },
          })),
        };
      }),
    );

    return { data: enriched, total, page, limit };
  }

  async findOne(id: string, user: User) {
    const deal = await this.dealsRepo.findOne({
      where: { id },
      relations: ['createdBy'],
    });
    if (!deal) throw new NotFoundException(`Deal ${id} not found`);
    await this.assertAccess(deal.id, user);

    const [conditions, milestones, parties] = await Promise.all([
      this.conditionsRepo.find({
        where: { deal: { id } },
        order: { displayOrder: 'ASC' },
      }),
      this.milestonesRepo.find({
        where: { deal: { id } },
        order: { displayOrder: 'ASC' },
      }),
      this.partiesRepo.find({
        where: { deal: { id }, isActive: true },
        relations: ['user'],
      }),
    ]);

    const daysToSettlement = deal.settlementDate
      ? Math.ceil((new Date(deal.settlementDate).getTime() - Date.now()) / 86400000)
      : null;

    return {
      ...deal,
      daysToSettlement,
      conditions,
      milestones,
      parties: parties.map((p) => ({
        id: p.id,
        role: p.partyRole,
        user: {
          id: p.user.id,
          name: p.user.fullName,
          email: p.user.email,
          phone: p.user.phone,
          firmName: p.user.firmName,
        },
      })),
    };
  }

  async update(id: string, dto: UpdateDealDto, user: User): Promise<Deal> {
    const deal = await this.getOrFail(id);
    await this.assertAccess(id, user);
    const old = { ...deal };
    Object.assign(deal, dto);
    await this.dealsRepo.save(deal);
    await this.auditService.log({
      dealId: id, userId: user.id, action: 'DEAL_UPDATED',
      entityType: 'deal', entityId: id, oldValue: old, newValue: dto,
    });
    return deal;
  }

  async updateStatus(id: string, dto: UpdateDealStatusDto, user: User): Promise<Deal> {
    const deal = await this.getOrFail(id);
    await this.assertAccess(id, user);
    this.validateTransition(deal.status, dto.status);

    const oldStatus = deal.status;
    deal.status = dto.status;
    if (dto.status === DealStatus.SETTLED) deal.actualSettledAt = new Date();
    await this.dealsRepo.save(deal);

    await this.auditService.log({
      dealId: id, userId: user.id, action: 'DEAL_STATUS_CHANGED',
      entityType: 'deal', entityId: id,
      oldValue: { status: oldStatus }, newValue: { status: dto.status },
    });

    await this.activityService.log({
      dealId: id, userId: user.id,
      eventType: 'STATUS_CHANGED' as any,
      message: `Deal status changed from ${oldStatus} to ${dto.status}${dto.reason ? `: ${dto.reason}` : ''}`,
    });

    this.gateway.emitToDeal(id, 'deal:updated', { dealId: id, status: dto.status });
    return deal;
  }

  async addParty(dealId: string, dto: AddPartyDto, actor: User): Promise<DealParty> {
    const deal = await this.getOrFail(dealId);
    const targetUser = await this.usersRepo.findOne({ where: { id: dto.userId } });
    if (!targetUser) throw new NotFoundException('User not found');

    const existing = await this.partiesRepo.findOne({
      where: { deal: { id: dealId }, partyRole: dto.partyRole },
    });
    if (existing) throw new BadRequestException(`A ${dto.partyRole} is already assigned to this deal`);

    const party = this.partiesRepo.create({
      deal,
      user: targetUser,
      partyRole: dto.partyRole,
      invitedAt: new Date(),
    });
    await this.partiesRepo.save(party);

    await this.activityService.log({
      dealId, userId: actor.id,
      eventType: 'PARTY_ADDED' as any,
      message: `${targetUser.fullName} was added as ${dto.partyRole}`,
    });

    return party;
  }

  async seedDefaultMilestones(dealId: string) {
    const deal = await this.getOrFail(dealId);
    const defaults = [
      { name: 'Contract Signed', type: MilestoneType.CONTRACT_SIGNED, order: 1 },
      { name: 'Deposit Paid', type: MilestoneType.DEPOSIT_PAID, order: 2 },
      { name: 'Finance Approved', type: MilestoneType.FINANCE_APPROVED, order: 3 },
      { name: 'Building & Pest Inspections', type: MilestoneType.INSPECTION_COMPLETE, order: 4 },
      { name: 'Title Check Complete', type: MilestoneType.TITLE_CHECKED, order: 5 },
      { name: 'Documents Verified', type: MilestoneType.DOCUMENTS_VERIFIED, order: 6 },
      { name: 'Settlement Booked', type: MilestoneType.SETTLEMENT_BOOKED, order: 7 },
      { name: 'Keys Released', type: MilestoneType.KEYS_RELEASED, order: 8 },
    ];

    const milestones = defaults.map((d) =>
      this.milestonesRepo.create({
        deal,
        name: d.name,
        milestoneType: d.type,
        displayOrder: d.order,
        status: MilestoneStatus.PENDING,
      }),
    );
    return this.milestonesRepo.save(milestones);
  }

  private async generateReferenceNo(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.dealsRepo.count();
    return `PSOS-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private validateTransition(current: DealStatus, next: DealStatus) {
    const valid: Record<DealStatus, DealStatus[]> = {
      [DealStatus.INIT]: [DealStatus.ACTIVE, DealStatus.CANCELLED],
      [DealStatus.ACTIVE]: [DealStatus.READY, DealStatus.CANCELLED],
      [DealStatus.READY]: [DealStatus.SETTLED, DealStatus.ACTIVE, DealStatus.CANCELLED],
      [DealStatus.SETTLED]: [],
      [DealStatus.CANCELLED]: [],
    };
    if (!valid[current]?.includes(next)) {
      throw new BadRequestException(`Cannot transition deal from ${current} to ${next}`);
    }
  }

  private roleToPartyRole(role: UserRole): PartyRole | null {
    const map: Partial<Record<UserRole, PartyRole>> = {
      [UserRole.BUYER]: PartyRole.BUYER,
      [UserRole.SELLER]: PartyRole.SELLER,
      [UserRole.BUYER_CONVEYANCER]: PartyRole.BUYER_CONVEYANCER,
      [UserRole.SELLER_CONVEYANCER]: PartyRole.SELLER_CONVEYANCER,
      [UserRole.AGENT]: PartyRole.AGENT,
    };
    return map[role] ?? null;
  }

  async assertAccess(dealId: string, user: User) {
    if (user.role === UserRole.ADMIN) return;
    const party = await this.partiesRepo.findOne({
      where: { deal: { id: dealId }, user: { id: user.id }, isActive: true },
    });
    if (!party) throw new ForbiddenException('You are not a party to this deal');
  }

  async getOrFail(id: string): Promise<Deal> {
    const deal = await this.dealsRepo.findOne({ where: { id } });
    if (!deal) throw new NotFoundException(`Deal ${id} not found`);
    return deal;
  }
}
