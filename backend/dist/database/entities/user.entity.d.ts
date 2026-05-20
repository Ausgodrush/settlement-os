export declare enum UserRole {
    BUYER = "BUYER",
    SELLER = "SELLER",
    BUYER_CONVEYANCER = "BUYER_CONVEYANCER",
    SELLER_CONVEYANCER = "SELLER_CONVEYANCER",
    AGENT = "AGENT",
    ADMIN = "ADMIN"
}
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    firmName: string;
    licenseNo: string;
    mfaSecret: string;
    mfaEnabled: boolean;
    isActive: boolean;
    lastLoginAt: Date;
    createdAt: Date;
    updatedAt: Date;
    get fullName(): string;
}
