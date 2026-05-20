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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const deal_entity_1 = require("../../database/entities/deal.entity");
const deal_party_entity_1 = require("../../database/entities/deal-party.entity");
const condition_entity_1 = require("../../database/entities/condition.entity");
const milestone_entity_1 = require("../../database/entities/milestone.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const audit_service_1 = require("../audit/audit.service");
const websockets_gateway_1 = require("../websockets/websockets.gateway");
const activity_service_1 = require("../audit/activity.service");
let DealsService = class DealsService {
    constructor(dealsRepo, partiesRepo, conditionsRepo, milestonesRepo, usersRepo, auditService, activityService, gateway) {
        this.dealsRepo = dealsRepo;
        this.partiesRepo = partiesRepo;
        this.conditionsRepo = conditionsRepo;
        this.milestonesRepo = milestonesRepo;
        this.usersRepo = usersRepo;
        this.auditService = auditService;
        this.activityService = activityService;
        this.gateway = gateway;
    }
    async create(dto, creator) {
        const referenceNo = await this.generateReferenceNo();
        const deal = this.dealsRepo.create({
            ...dto,
            referenceNo,
            status: deal_entity_1.DealStatus.INIT,
            createdBy: creator,
        });
        await this.dealsRepo.save(deal);
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
            newValue: { referenceNo, status: deal_entity_1.DealStatus.INIT },
        });
        return deal;
    }
    async findAll(query, user) {
        const qb = this.dealsRepo
            .createQueryBuilder('deal')
            .leftJoinAndSelect('deal.createdBy', 'createdBy');
        if (user.role !== user_entity_1.UserRole.ADMIN) {
            qb.innerJoin('deal_parties', 'dp', 'dp.deal_id = deal.id AND dp.user_id = :userId AND dp.is_active = true', { userId: user.id });
        }
        if (query.status)
            qb.andWhere('deal.status = :status', { status: query.status });
        if (query.search) {
            qb.andWhere('(deal.propertyAddress ILIKE :s OR deal.referenceNo ILIKE :s OR deal.propertySuburb ILIKE :s)', { s: `%${query.search}%` });
        }
        const total = await qb.getCount();
        const page = query.page || 1;
        const limit = Math.min(query.limit || 20, 100);
        qb.skip((page - 1) * limit).take(limit).orderBy('deal.settlementDate', 'ASC', 'NULLS LAST');
        const deals = await qb.getMany();
        const enriched = await Promise.all(deals.map(async (deal) => {
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
                    met: conditions.filter((c) => c.status === condition_entity_1.ConditionStatus.MET).length,
                    pending: conditions.filter((c) => c.status === condition_entity_1.ConditionStatus.PENDING).length,
                },
                parties: parties.map((p) => ({
                    id: p.id,
                    role: p.partyRole,
                    user: { id: p.user.id, name: p.user.fullName, email: p.user.email },
                })),
            };
        }));
        return { data: enriched, total, page, limit };
    }
    async findOne(id, user) {
        const deal = await this.dealsRepo.findOne({
            where: { id },
            relations: ['createdBy'],
        });
        if (!deal)
            throw new common_1.NotFoundException(`Deal ${id} not found`);
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
    async update(id, dto, user) {
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
    async updateStatus(id, dto, user) {
        const deal = await this.getOrFail(id);
        await this.assertAccess(id, user);
        this.validateTransition(deal.status, dto.status);
        const oldStatus = deal.status;
        deal.status = dto.status;
        if (dto.status === deal_entity_1.DealStatus.SETTLED)
            deal.actualSettledAt = new Date();
        await this.dealsRepo.save(deal);
        await this.auditService.log({
            dealId: id, userId: user.id, action: 'DEAL_STATUS_CHANGED',
            entityType: 'deal', entityId: id,
            oldValue: { status: oldStatus }, newValue: { status: dto.status },
        });
        await this.activityService.log({
            dealId: id, userId: user.id,
            eventType: 'STATUS_CHANGED',
            message: `Deal status changed from ${oldStatus} to ${dto.status}${dto.reason ? `: ${dto.reason}` : ''}`,
        });
        this.gateway.emitToDeal(id, 'deal:updated', { dealId: id, status: dto.status });
        return deal;
    }
    async addParty(dealId, dto, actor) {
        const deal = await this.getOrFail(dealId);
        const targetUser = await this.usersRepo.findOne({ where: { id: dto.userId } });
        if (!targetUser)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.partiesRepo.findOne({
            where: { deal: { id: dealId }, partyRole: dto.partyRole },
        });
        if (existing)
            throw new common_1.BadRequestException(`A ${dto.partyRole} is already assigned to this deal`);
        const party = this.partiesRepo.create({
            deal,
            user: targetUser,
            partyRole: dto.partyRole,
            invitedAt: new Date(),
        });
        await this.partiesRepo.save(party);
        await this.activityService.log({
            dealId, userId: actor.id,
            eventType: 'PARTY_ADDED',
            message: `${targetUser.fullName} was added as ${dto.partyRole}`,
        });
        return party;
    }
    async seedDefaultMilestones(dealId) {
        const deal = await this.getOrFail(dealId);
        const defaults = [
            { name: 'Contract Signed', type: milestone_entity_1.MilestoneType.CONTRACT_SIGNED, order: 1 },
            { name: 'Deposit Paid', type: milestone_entity_1.MilestoneType.DEPOSIT_PAID, order: 2 },
            { name: 'Finance Approved', type: milestone_entity_1.MilestoneType.FINANCE_APPROVED, order: 3 },
            { name: 'Building & Pest Inspections', type: milestone_entity_1.MilestoneType.INSPECTION_COMPLETE, order: 4 },
            { name: 'Title Check Complete', type: milestone_entity_1.MilestoneType.TITLE_CHECKED, order: 5 },
            { name: 'Documents Verified', type: milestone_entity_1.MilestoneType.DOCUMENTS_VERIFIED, order: 6 },
            { name: 'Settlement Booked', type: milestone_entity_1.MilestoneType.SETTLEMENT_BOOKED, order: 7 },
            { name: 'Keys Released', type: milestone_entity_1.MilestoneType.KEYS_RELEASED, order: 8 },
        ];
        const milestones = defaults.map((d) => this.milestonesRepo.create({
            deal,
            name: d.name,
            milestoneType: d.type,
            displayOrder: d.order,
            status: milestone_entity_1.MilestoneStatus.PENDING,
        }));
        return this.milestonesRepo.save(milestones);
    }
    async generateReferenceNo() {
        const year = new Date().getFullYear();
        const count = await this.dealsRepo.count();
        return `PSOS-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    validateTransition(current, next) {
        const valid = {
            [deal_entity_1.DealStatus.INIT]: [deal_entity_1.DealStatus.ACTIVE, deal_entity_1.DealStatus.CANCELLED],
            [deal_entity_1.DealStatus.ACTIVE]: [deal_entity_1.DealStatus.READY, deal_entity_1.DealStatus.CANCELLED],
            [deal_entity_1.DealStatus.READY]: [deal_entity_1.DealStatus.SETTLED, deal_entity_1.DealStatus.ACTIVE, deal_entity_1.DealStatus.CANCELLED],
            [deal_entity_1.DealStatus.SETTLED]: [],
            [deal_entity_1.DealStatus.CANCELLED]: [],
        };
        if (!valid[current]?.includes(next)) {
            throw new common_1.BadRequestException(`Cannot transition deal from ${current} to ${next}`);
        }
    }
    roleToPartyRole(role) {
        const map = {
            [user_entity_1.UserRole.BUYER]: deal_party_entity_1.PartyRole.BUYER,
            [user_entity_1.UserRole.SELLER]: deal_party_entity_1.PartyRole.SELLER,
            [user_entity_1.UserRole.BUYER_CONVEYANCER]: deal_party_entity_1.PartyRole.BUYER_CONVEYANCER,
            [user_entity_1.UserRole.SELLER_CONVEYANCER]: deal_party_entity_1.PartyRole.SELLER_CONVEYANCER,
            [user_entity_1.UserRole.AGENT]: deal_party_entity_1.PartyRole.AGENT,
        };
        return map[role] ?? null;
    }
    async assertAccess(dealId, user) {
        if (user.role === user_entity_1.UserRole.ADMIN)
            return;
        const party = await this.partiesRepo.findOne({
            where: { deal: { id: dealId }, user: { id: user.id }, isActive: true },
        });
        if (!party)
            throw new common_1.ForbiddenException('You are not a party to this deal');
    }
    async getOrFail(id) {
        const deal = await this.dealsRepo.findOne({ where: { id } });
        if (!deal)
            throw new common_1.NotFoundException(`Deal ${id} not found`);
        return deal;
    }
};
exports.DealsService = DealsService;
exports.DealsService = DealsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(deal_entity_1.Deal)),
    __param(1, (0, typeorm_1.InjectRepository)(deal_party_entity_1.DealParty)),
    __param(2, (0, typeorm_1.InjectRepository)(condition_entity_1.Condition)),
    __param(3, (0, typeorm_1.InjectRepository)(milestone_entity_1.Milestone)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService,
        activity_service_1.ActivityService,
        websockets_gateway_1.WebsocketsGateway])
], DealsService);
//# sourceMappingURL=deals.service.js.map