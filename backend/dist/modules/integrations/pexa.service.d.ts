import { ConfigService } from '@nestjs/config';
export interface PexaSettlementInput {
    workspaceId: string;
    dealReference: string;
}
export interface PexaSettlementResult {
    workspaceId: string;
    lodgementRef: string;
    status: string;
    completedAt: Date;
}
export declare class PexaService {
    private readonly config;
    private readonly logger;
    private readonly mockMode;
    constructor(config: ConfigService);
    triggerSettlement(input: PexaSettlementInput): Promise<PexaSettlementResult>;
    getWorkspaceStatus(workspaceId: string): Promise<{
        workspaceId: string;
        status: string;
        lastUpdated: Date;
    }>;
    createWorkspace(dealReference: string, settlementDate: Date): Promise<{
        workspaceId: string;
        status: string;
    }>;
    private mockTriggerSettlement;
    private realTriggerSettlement;
}
