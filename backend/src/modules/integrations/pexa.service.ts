import { Injectable, Logger } from '@nestjs/common';
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

/**
 * PEXA Integration Service
 *
 * MVP: Fully mocked. Simulates PEXA workspace creation and settlement triggering.
 * Production (Phase 2): Replace with real PEXA NECS API (OAuth2 + REST).
 *   See: https://developers.pexa.com.au
 */
@Injectable()
export class PexaService {
  private readonly logger = new Logger(PexaService.name);
  private readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.mockMode = config.get('PEXA_MOCK_MODE', 'true') === 'true';
  }

  async triggerSettlement(input: PexaSettlementInput): Promise<PexaSettlementResult> {
    if (this.mockMode) {
      return this.mockTriggerSettlement(input);
    }
    return this.realTriggerSettlement(input);
  }

  async getWorkspaceStatus(workspaceId: string) {
    if (this.mockMode) {
      return {
        workspaceId,
        status: 'READY_FOR_SETTLEMENT',
        lastUpdated: new Date(),
      };
    }
    // Real PEXA API call would go here
    throw new Error('Real PEXA not configured');
  }

  async createWorkspace(dealReference: string, settlementDate: Date) {
    if (this.mockMode) {
      const workspaceId = `WS-MOCK-${Date.now()}`;
      this.logger.log(`[Mock PEXA] Created workspace ${workspaceId} for deal ${dealReference}`);
      return { workspaceId, status: 'CREATED' };
    }
    throw new Error('Real PEXA not configured');
  }

  private async mockTriggerSettlement(input: PexaSettlementInput): Promise<PexaSettlementResult> {
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 800));

    const lodgementRef = `SA-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
    this.logger.log(
      `[Mock PEXA] Settlement triggered for workspace ${input.workspaceId} | Lodgement: ${lodgementRef}`,
    );

    return {
      workspaceId: input.workspaceId,
      lodgementRef,
      status: 'SETTLEMENT_COMPLETE',
      completedAt: new Date(),
    };
  }

  private async realTriggerSettlement(input: PexaSettlementInput): Promise<PexaSettlementResult> {
    /**
     * Phase 2: Real PEXA NECS API integration.
     *
     * Flow:
     * 1. Authenticate via PEXA OAuth2
     * 2. GET /workspace/{workspaceId} — verify workspace is ready
     * 3. POST /workspace/{workspaceId}/settlement — trigger settlement
     * 4. Poll or receive webhook for SETTLEMENT_COMPLETE status
     * 5. Return lodgement reference
     */
    throw new Error('Real PEXA integration not yet implemented. Set PEXA_MOCK_MODE=true for MVP.');
  }
}
