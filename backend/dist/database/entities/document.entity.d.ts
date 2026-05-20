import { Deal } from './deal.entity';
import { User } from './user.entity';
export declare enum DocType {
    CONTRACT = "CONTRACT",
    ID_VERIFICATION = "ID_VERIFICATION",
    FINANCE_APPROVAL = "FINANCE_APPROVAL",
    BUILDING_INSPECTION = "BUILDING_INSPECTION",
    PEST_INSPECTION = "PEST_INSPECTION",
    TITLE_SEARCH = "TITLE_SEARCH",
    DISCHARGE_MORTGAGE = "DISCHARGE_MORTGAGE",
    TRANSFER = "TRANSFER",
    SETTLEMENT_STATEMENT = "SETTLEMENT_STATEMENT",
    DISCLOSURE = "DISCLOSURE",
    OTHER = "OTHER"
}
export declare class Document {
    id: string;
    deal: Deal;
    uploadedBy: User;
    name: string;
    originalFilename: string;
    docType: DocType;
    s3Bucket: string;
    s3Key: string;
    fileSizeBytes: number;
    mimeType: string;
    checksumSha256: string;
    isSigned: boolean;
    docusignEnvelopeId: string;
    verified: boolean;
    verifiedBy: User;
    verifiedAt: Date;
    deletedAt: Date;
    createdAt: Date;
}
