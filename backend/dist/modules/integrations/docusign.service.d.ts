import { ConfigService } from '@nestjs/config';
export interface SigningRequest {
    documentId: string;
    documentName: string;
    s3Key: string;
    signers: Array<{
        name: string;
        email: string;
        role: string;
    }>;
    dealId: string;
}
export interface SigningResult {
    envelopeId: string;
    signingUrl: string;
    status: string;
}
export declare class DocuSignService {
    private readonly config;
    private readonly logger;
    private readonly mockMode;
    constructor(config: ConfigService);
    createEnvelope(request: SigningRequest): Promise<SigningResult>;
    getEnvelopeStatus(envelopeId: string): Promise<{
        envelopeId: string;
        status: string;
        completedAt: Date;
        signers: {
            status: string;
            signedAt: Date;
        }[];
    }>;
    private mockCreateEnvelope;
    private realCreateEnvelope;
}
