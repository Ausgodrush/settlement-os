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
var DemoSeeder_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../../database/entities/user.entity");
const deal_entity_1 = require("../../database/entities/deal.entity");
const deal_party_entity_1 = require("../../database/entities/deal-party.entity");
const condition_entity_1 = require("../../database/entities/condition.entity");
let DemoSeeder = DemoSeeder_1 = class DemoSeeder {
    constructor(usersRepo, dealsRepo, partiesRepo, conditionsRepo) {
        this.usersRepo = usersRepo;
        this.dealsRepo = dealsRepo;
        this.partiesRepo = partiesRepo;
        this.conditionsRepo = conditionsRepo;
        this.logger = new common_1.Logger(DemoSeeder_1.name);
    }
    async onApplicationBootstrap() {
        const existing = await this.usersRepo.count();
        if (existing > 0)
            return;
        this.logger.log('[Demo] Seeding demo data...');
        await this.seed();
        this.logger.log('[Demo] Demo data ready. Login: admin@demo.com / demo1234');
    }
    async seed() {
        const hash = await bcrypt.hash('demo1234', 10);
        const admin = await this.usersRepo.save(this.usersRepo.create({
            email: 'admin@demo.com',
            passwordHash: hash,
            firstName: 'Alex',
            lastName: 'Admin',
            role: user_entity_1.UserRole.ADMIN,
            firmName: 'Settlement OS',
            isActive: true,
        }));
        const buyerConv = await this.usersRepo.save(this.usersRepo.create({
            email: 'buyer-conv@demo.com',
            passwordHash: hash,
            firstName: 'Sarah',
            lastName: 'Mitchell',
            role: user_entity_1.UserRole.BUYER_CONVEYANCER,
            firmName: 'Mitchell Law Group',
            licenseNo: 'SA-CONV-4821',
            isActive: true,
        }));
        const sellerConv = await this.usersRepo.save(this.usersRepo.create({
            email: 'seller-conv@demo.com',
            passwordHash: hash,
            firstName: 'David',
            lastName: 'Chen',
            role: user_entity_1.UserRole.SELLER_CONVEYANCER,
            firmName: 'Chen Legal Partners',
            licenseNo: 'SA-CONV-3304',
            isActive: true,
        }));
        const buyer = await this.usersRepo.save(this.usersRepo.create({
            email: 'buyer@demo.com',
            passwordHash: hash,
            firstName: 'James',
            lastName: 'Thompson',
            role: user_entity_1.UserRole.BUYER,
            isActive: true,
        }));
        const seller = await this.usersRepo.save(this.usersRepo.create({
            email: 'seller@demo.com',
            passwordHash: hash,
            firstName: 'Emma',
            lastName: 'Rodriguez',
            role: user_entity_1.UserRole.SELLER,
            isActive: true,
        }));
        const deal1 = await this.dealsRepo.save(this.dealsRepo.create({
            referenceNo: 'DEMO-001',
            status: deal_entity_1.DealStatus.ACTIVE,
            propertyAddress: '42 Prospect Street, Prospect SA 5082',
            propertySuburb: 'Prospect',
            propertyState: 'SA',
            propertyPostcode: '5082',
            titleReference: 'CT 5432/876',
            purchasePrice: 750000,
            depositAmount: 75000,
            depositPaid: true,
            depositPaidAt: new Date('2026-04-15'),
            contractDate: new Date('2026-04-10'),
            settlementDate: new Date('2026-06-10'),
            pexaStatus: 'LODGED',
            notes: 'Finance and inspections cleared. Awaiting Section 7 search from council.',
            createdBy: admin,
        }));
        await this.partiesRepo.save([
            this.partiesRepo.create({ deal: deal1, user: buyer, partyRole: deal_party_entity_1.PartyRole.BUYER, isActive: true, acceptedAt: new Date() }),
            this.partiesRepo.create({ deal: deal1, user: seller, partyRole: deal_party_entity_1.PartyRole.SELLER, isActive: true, acceptedAt: new Date() }),
            this.partiesRepo.create({ deal: deal1, user: buyerConv, partyRole: deal_party_entity_1.PartyRole.BUYER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
            this.partiesRepo.create({ deal: deal1, user: sellerConv, partyRole: deal_party_entity_1.PartyRole.SELLER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
        ]);
        await this.conditionsRepo.save([
            this.conditionsRepo.create({
                deal: deal1,
                name: 'Finance Approval',
                description: 'Unconditional finance approval from lender',
                conditionType: condition_entity_1.ConditionType.BOOLEAN_FLAG,
                ruleJson: { flag: true },
                status: condition_entity_1.ConditionStatus.MET,
                assignedToRole: 'BUYER_CONVEYANCER',
                metAt: new Date('2026-04-28'),
                displayOrder: 1,
            }),
            this.conditionsRepo.create({
                deal: deal1,
                name: 'Building & Pest Inspection',
                description: 'Satisfactory building and pest inspection report',
                conditionType: condition_entity_1.ConditionType.DOCUMENT_UPLOAD,
                ruleJson: { requiresDocument: true },
                status: condition_entity_1.ConditionStatus.MET,
                assignedToRole: 'BUYER_CONVEYANCER',
                metAt: new Date('2026-04-30'),
                displayOrder: 2,
            }),
            this.conditionsRepo.create({
                deal: deal1,
                name: 'Section 7 Certificate',
                description: 'SA Council Section 7 certificate confirming no encumbrances',
                conditionType: condition_entity_1.ConditionType.EXTERNAL_CONFIRMATION,
                ruleJson: { provider: 'council', daysAllowed: 10 },
                status: condition_entity_1.ConditionStatus.PENDING,
                assignedToRole: 'SELLER_CONVEYANCER',
                dueDate: new Date('2026-05-28'),
                displayOrder: 3,
            }),
            this.conditionsRepo.create({
                deal: deal1,
                name: 'Title Search',
                description: 'Clear title confirmed with Land Services SA',
                conditionType: condition_entity_1.ConditionType.EXTERNAL_CONFIRMATION,
                ruleJson: { provider: 'land_services_sa' },
                status: condition_entity_1.ConditionStatus.MET,
                assignedToRole: 'BUYER_CONVEYANCER',
                metAt: new Date('2026-05-05'),
                displayOrder: 4,
            }),
        ]);
        const deal2 = await this.dealsRepo.save(this.dealsRepo.create({
            referenceNo: 'DEMO-002',
            status: deal_entity_1.DealStatus.ACTIVE,
            propertyAddress: '15 King William Road, Unley SA 5061',
            propertySuburb: 'Unley',
            propertyState: 'SA',
            propertyPostcode: '5061',
            titleReference: 'CT 6701/234',
            purchasePrice: 1200000,
            depositAmount: 120000,
            depositPaid: false,
            contractDate: new Date('2026-05-12'),
            settlementDate: new Date('2026-07-18'),
            notes: 'High-value property. Finance condition expires 30 May.',
            createdBy: admin,
        }));
        await this.partiesRepo.save([
            this.partiesRepo.create({ deal: deal2, user: buyerConv, partyRole: deal_party_entity_1.PartyRole.BUYER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
            this.partiesRepo.create({ deal: deal2, user: sellerConv, partyRole: deal_party_entity_1.PartyRole.SELLER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
        ]);
        await this.conditionsRepo.save([
            this.conditionsRepo.create({
                deal: deal2,
                name: 'Finance Approval',
                description: 'Unconditional finance approval from lender',
                conditionType: condition_entity_1.ConditionType.DATE_DEADLINE,
                ruleJson: { deadline: '2026-05-30' },
                status: condition_entity_1.ConditionStatus.PENDING,
                assignedToRole: 'BUYER_CONVEYANCER',
                dueDate: new Date('2026-05-30'),
                displayOrder: 1,
            }),
            this.conditionsRepo.create({
                deal: deal2,
                name: 'Deposit Payment',
                description: '10% deposit to be held in trust',
                conditionType: condition_entity_1.ConditionType.BOOLEAN_FLAG,
                ruleJson: { flag: false },
                status: condition_entity_1.ConditionStatus.PENDING,
                assignedToRole: 'BUYER_CONVEYANCER',
                dueDate: new Date('2026-05-26'),
                displayOrder: 2,
            }),
            this.conditionsRepo.create({
                deal: deal2,
                name: 'Building Inspection',
                description: 'Inspection by licensed building inspector',
                conditionType: condition_entity_1.ConditionType.DOCUMENT_UPLOAD,
                ruleJson: { requiresDocument: true },
                status: condition_entity_1.ConditionStatus.PENDING,
                assignedToRole: 'BUYER_CONVEYANCER',
                dueDate: new Date('2026-06-01'),
                displayOrder: 3,
            }),
        ]);
        const deal3 = await this.dealsRepo.save(this.dealsRepo.create({
            referenceNo: 'DEMO-003',
            status: deal_entity_1.DealStatus.SETTLED,
            propertyAddress: '8 Greenhill Road, Tusmore SA 5065',
            propertySuburb: 'Tusmore',
            propertyState: 'SA',
            propertyPostcode: '5065',
            titleReference: 'CT 4219/551',
            purchasePrice: 980000,
            depositAmount: 98000,
            depositPaid: true,
            depositPaidAt: new Date('2026-03-01'),
            contractDate: new Date('2026-02-20'),
            settlementDate: new Date('2026-04-25'),
            actualSettledAt: new Date('2026-04-25T10:30:00Z'),
            pexaStatus: 'SETTLED',
            createdBy: admin,
        }));
        await this.partiesRepo.save([
            this.partiesRepo.create({ deal: deal3, user: buyerConv, partyRole: deal_party_entity_1.PartyRole.BUYER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
            this.partiesRepo.create({ deal: deal3, user: sellerConv, partyRole: deal_party_entity_1.PartyRole.SELLER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
        ]);
    }
};
exports.DemoSeeder = DemoSeeder;
exports.DemoSeeder = DemoSeeder = DemoSeeder_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(deal_entity_1.Deal)),
    __param(2, (0, typeorm_1.InjectRepository)(deal_party_entity_1.DealParty)),
    __param(3, (0, typeorm_1.InjectRepository)(condition_entity_1.Condition)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DemoSeeder);
//# sourceMappingURL=demo-seeder.js.map