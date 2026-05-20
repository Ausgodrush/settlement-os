import { Deal } from './deal.entity';
import { User } from './user.entity';
export declare enum PartyRole {
    BUYER = "BUYER",
    SELLER = "SELLER",
    BUYER_CONVEYANCER = "BUYER_CONVEYANCER",
    SELLER_CONVEYANCER = "SELLER_CONVEYANCER",
    AGENT = "AGENT"
}
export declare class DealParty {
    id: string;
    deal: Deal;
    user: User;
    partyRole: PartyRole;
    invitedAt: Date;
    acceptedAt: Date;
    isActive: boolean;
    createdAt: Date;
}
