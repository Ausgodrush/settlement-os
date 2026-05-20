import { User } from '../../database/entities/user.entity';
import { DealsService } from './deals.service';
import { CreateDealDto, UpdateDealDto, UpdateDealStatusDto, AddPartyDto, DealQueryDto } from './dto/deals.dto';
export declare class DealsController {
    private readonly dealsService;
    constructor(dealsService: DealsService);
    create(dto: CreateDealDto, user: User): Promise<import("../../database/entities/deal.entity").Deal>;
    findAll(query: DealQueryDto, user: User): Promise<{
        data: {
            daysToSettlement: number | null;
            conditionsSummary: {
                total: number;
                met: number;
                pending: number;
            };
            parties: {
                id: string;
                role: import("../../database/entities/deal-party.entity").PartyRole;
                user: {
                    id: string;
                    name: string;
                    email: string;
                };
            }[];
            id: string;
            referenceNo: string;
            status: import("../../database/entities/deal.entity").DealStatus;
            propertyAddress: string;
            propertySuburb: string;
            propertyState: string;
            propertyPostcode: string;
            titleReference: string;
            landServicesRef: string;
            purchasePrice: number;
            depositAmount: number;
            depositPaid: boolean;
            depositPaidAt: Date;
            contractDate: Date;
            settlementDate: Date;
            actualSettledAt: Date;
            pexaWorkspaceId: string;
            pexaStatus: string;
            notes: string;
            createdBy: User;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string, user: User): Promise<{
        daysToSettlement: number | null;
        conditions: import("../../database/entities/condition.entity").Condition[];
        milestones: import("../../database/entities/milestone.entity").Milestone[];
        parties: {
            id: string;
            role: import("../../database/entities/deal-party.entity").PartyRole;
            user: {
                id: string;
                name: string;
                email: string;
                phone: string;
                firmName: string;
            };
        }[];
        id: string;
        referenceNo: string;
        status: import("../../database/entities/deal.entity").DealStatus;
        propertyAddress: string;
        propertySuburb: string;
        propertyState: string;
        propertyPostcode: string;
        titleReference: string;
        landServicesRef: string;
        purchasePrice: number;
        depositAmount: number;
        depositPaid: boolean;
        depositPaidAt: Date;
        contractDate: Date;
        settlementDate: Date;
        actualSettledAt: Date;
        pexaWorkspaceId: string;
        pexaStatus: string;
        notes: string;
        createdBy: User;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateDealDto, user: User): Promise<import("../../database/entities/deal.entity").Deal>;
    updateStatus(id: string, dto: UpdateDealStatusDto, user: User): Promise<import("../../database/entities/deal.entity").Deal>;
    addParty(id: string, dto: AddPartyDto, user: User): Promise<import("../../database/entities/deal-party.entity").DealParty>;
    seedMilestones(id: string): Promise<import("../../database/entities/milestone.entity").Milestone[]>;
}
