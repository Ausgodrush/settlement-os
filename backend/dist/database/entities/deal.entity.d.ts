import { User } from './user.entity';
export declare enum DealStatus {
    INIT = "INIT",
    ACTIVE = "ACTIVE",
    READY = "READY",
    SETTLED = "SETTLED",
    CANCELLED = "CANCELLED"
}
export declare class Deal {
    id: string;
    referenceNo: string;
    status: DealStatus;
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
}
