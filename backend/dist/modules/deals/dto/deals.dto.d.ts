import { DealStatus } from '../../../database/entities/deal.entity';
import { PartyRole } from '../../../database/entities/deal-party.entity';
export declare class CreateDealDto {
    propertyAddress: string;
    propertySuburb: string;
    propertyState?: string;
    propertyPostcode: string;
    titleReference?: string;
    purchasePrice: number;
    depositAmount?: number;
    contractDate?: string;
    settlementDate?: string;
    notes?: string;
}
export declare class UpdateDealDto {
    settlementDate?: string;
    titleReference?: string;
    landServicesRef?: string;
    pexaWorkspaceId?: string;
    notes?: string;
    purchasePrice?: number;
}
export declare class UpdateDealStatusDto {
    status: DealStatus;
    reason?: string;
}
export declare class AddPartyDto {
    userId: string;
    partyRole: PartyRole;
}
export declare class DealQueryDto {
    status?: DealStatus;
    search?: string;
    page?: number;
    limit?: number;
}
