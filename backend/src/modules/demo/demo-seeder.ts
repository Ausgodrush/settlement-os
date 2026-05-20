import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '../../database/entities/user.entity';
import { Deal, DealStatus } from '../../database/entities/deal.entity';
import { DealParty, PartyRole } from '../../database/entities/deal-party.entity';
import { Condition, ConditionType, ConditionStatus } from '../../database/entities/condition.entity';

@Injectable()
export class DemoSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DemoSeeder.name);

  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Deal) private readonly dealsRepo: Repository<Deal>,
    @InjectRepository(DealParty) private readonly partiesRepo: Repository<DealParty>,
    @InjectRepository(Condition) private readonly conditionsRepo: Repository<Condition>,
  ) {}

  async onApplicationBootstrap() {
    const existing = await this.usersRepo.count();
    if (existing > 0) return; // Already seeded in this session

    this.logger.log('[Demo] Seeding demo data...');
    await this.seed();
    this.logger.log('[Demo] Demo data ready. Login: admin@demo.com / demo1234');
  }

  private async seed() {
    const hash = await bcrypt.hash('demo1234', 10);

    // --- Users ---
    const admin = await this.usersRepo.save(
      this.usersRepo.create({
        email: 'admin@demo.com',
        passwordHash: hash,
        firstName: 'Alex',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        firmName: 'Settlement OS',
        isActive: true,
      }),
    );

    const buyerConv = await this.usersRepo.save(
      this.usersRepo.create({
        email: 'buyer-conv@demo.com',
        passwordHash: hash,
        firstName: 'Sarah',
        lastName: 'Mitchell',
        role: UserRole.BUYER_CONVEYANCER,
        firmName: 'Mitchell Law Group',
        licenseNo: 'SA-CONV-4821',
        isActive: true,
      }),
    );

    const sellerConv = await this.usersRepo.save(
      this.usersRepo.create({
        email: 'seller-conv@demo.com',
        passwordHash: hash,
        firstName: 'David',
        lastName: 'Chen',
        role: UserRole.SELLER_CONVEYANCER,
        firmName: 'Chen Legal Partners',
        licenseNo: 'SA-CONV-3304',
        isActive: true,
      }),
    );

    const buyer = await this.usersRepo.save(
      this.usersRepo.create({
        email: 'buyer@demo.com',
        passwordHash: hash,
        firstName: 'James',
        lastName: 'Thompson',
        role: UserRole.BUYER,
        isActive: true,
      }),
    );

    const seller = await this.usersRepo.save(
      this.usersRepo.create({
        email: 'seller@demo.com',
        passwordHash: hash,
        firstName: 'Emma',
        lastName: 'Rodriguez',
        role: UserRole.SELLER,
        isActive: true,
      }),
    );

    // --- Deal 1: Near settlement (ACTIVE) ---
    const deal1 = await this.dealsRepo.save(
      this.dealsRepo.create({
        referenceNo: 'DEMO-001',
        status: DealStatus.ACTIVE,
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
      }),
    );

    await this.partiesRepo.save([
      this.partiesRepo.create({ deal: deal1, user: buyer, partyRole: PartyRole.BUYER, isActive: true, acceptedAt: new Date() }),
      this.partiesRepo.create({ deal: deal1, user: seller, partyRole: PartyRole.SELLER, isActive: true, acceptedAt: new Date() }),
      this.partiesRepo.create({ deal: deal1, user: buyerConv, partyRole: PartyRole.BUYER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
      this.partiesRepo.create({ deal: deal1, user: sellerConv, partyRole: PartyRole.SELLER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
    ]);

    await this.conditionsRepo.save([
      this.conditionsRepo.create({
        deal: deal1,
        name: 'Finance Approval',
        description: 'Unconditional finance approval from lender',
        conditionType: ConditionType.BOOLEAN_FLAG,
        ruleJson: { flag: true },
        status: ConditionStatus.MET,
        assignedToRole: 'BUYER_CONVEYANCER',
        metAt: new Date('2026-04-28'),
        displayOrder: 1,
      }),
      this.conditionsRepo.create({
        deal: deal1,
        name: 'Building & Pest Inspection',
        description: 'Satisfactory building and pest inspection report',
        conditionType: ConditionType.DOCUMENT_UPLOAD,
        ruleJson: { requiresDocument: true },
        status: ConditionStatus.MET,
        assignedToRole: 'BUYER_CONVEYANCER',
        metAt: new Date('2026-04-30'),
        displayOrder: 2,
      }),
      this.conditionsRepo.create({
        deal: deal1,
        name: 'Section 7 Certificate',
        description: 'SA Council Section 7 certificate confirming no encumbrances',
        conditionType: ConditionType.EXTERNAL_CONFIRMATION,
        ruleJson: { provider: 'council', daysAllowed: 10 },
        status: ConditionStatus.PENDING,
        assignedToRole: 'SELLER_CONVEYANCER',
        dueDate: new Date('2026-05-28'),
        displayOrder: 3,
      }),
      this.conditionsRepo.create({
        deal: deal1,
        name: 'Title Search',
        description: 'Clear title confirmed with Land Services SA',
        conditionType: ConditionType.EXTERNAL_CONFIRMATION,
        ruleJson: { provider: 'land_services_sa' },
        status: ConditionStatus.MET,
        assignedToRole: 'BUYER_CONVEYANCER',
        metAt: new Date('2026-05-05'),
        displayOrder: 4,
      }),
    ]);

    // --- Deal 2: Early stage (ACTIVE) ---
    const deal2 = await this.dealsRepo.save(
      this.dealsRepo.create({
        referenceNo: 'DEMO-002',
        status: DealStatus.ACTIVE,
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
      }),
    );

    await this.partiesRepo.save([
      this.partiesRepo.create({ deal: deal2, user: buyerConv, partyRole: PartyRole.BUYER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
      this.partiesRepo.create({ deal: deal2, user: sellerConv, partyRole: PartyRole.SELLER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
    ]);

    await this.conditionsRepo.save([
      this.conditionsRepo.create({
        deal: deal2,
        name: 'Finance Approval',
        description: 'Unconditional finance approval from lender',
        conditionType: ConditionType.DATE_DEADLINE,
        ruleJson: { deadline: '2026-05-30' },
        status: ConditionStatus.PENDING,
        assignedToRole: 'BUYER_CONVEYANCER',
        dueDate: new Date('2026-05-30'),
        displayOrder: 1,
      }),
      this.conditionsRepo.create({
        deal: deal2,
        name: 'Deposit Payment',
        description: '10% deposit to be held in trust',
        conditionType: ConditionType.BOOLEAN_FLAG,
        ruleJson: { flag: false },
        status: ConditionStatus.PENDING,
        assignedToRole: 'BUYER_CONVEYANCER',
        dueDate: new Date('2026-05-26'),
        displayOrder: 2,
      }),
      this.conditionsRepo.create({
        deal: deal2,
        name: 'Building Inspection',
        description: 'Inspection by licensed building inspector',
        conditionType: ConditionType.DOCUMENT_UPLOAD,
        ruleJson: { requiresDocument: true },
        status: ConditionStatus.PENDING,
        assignedToRole: 'BUYER_CONVEYANCER',
        dueDate: new Date('2026-06-01'),
        displayOrder: 3,
      }),
    ]);

    // --- Deal 3: Settled (SETTLED) ---
    const deal3 = await this.dealsRepo.save(
      this.dealsRepo.create({
        referenceNo: 'DEMO-003',
        status: DealStatus.SETTLED,
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
      }),
    );

    await this.partiesRepo.save([
      this.partiesRepo.create({ deal: deal3, user: buyerConv, partyRole: PartyRole.BUYER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
      this.partiesRepo.create({ deal: deal3, user: sellerConv, partyRole: PartyRole.SELLER_CONVEYANCER, isActive: true, acceptedAt: new Date() }),
    ]);
  }
}
