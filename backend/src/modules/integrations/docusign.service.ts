import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SigningRequest {
  documentId: string;
  documentName: string;
  s3Key: string;
  signers: Array<{ name: string; email: string; role: string }>;
  dealId: string;
}

export interface SigningResult {
  envelopeId: string;
  signingUrl: string;
  status: string;
}

/**
 * DocuSign Integration Service
 *
 * MVP: Fully mocked.
 * Phase 2: Wire up DocuSign eSignature API via @docusign/esign SDK.
 */
@Injectable()
export class DocuSignService {
  private readonly logger = new Logger(DocuSignService.name);
  private readonly mockMode: boolean;

  constructor(private readonly config: ConfigService) {
    this.mockMode = config.get('DOCUSIGN_MOCK_MODE', 'true') === 'true';
  }

  async createEnvelope(request: SigningRequest): Promise<SigningResult> {
    if (this.mockMode) {
      return this.mockCreateEnvelope(request);
    }
    return this.realCreateEnvelope(request);
  }

  async getEnvelopeStatus(envelopeId: string) {
    if (this.mockMode) {
      return {
        envelopeId,
        status: 'completed',
        completedAt: new Date(),
        signers: [{ status: 'signed', signedAt: new Date() }],
      };
    }
    throw new Error('Real DocuSign not configured');
  }

  private async mockCreateEnvelope(request: SigningRequest): Promise<SigningResult> {
    await new Promise((r) => setTimeout(r, 300));
    const envelopeId = `ENV-MOCK-${Date.now()}`;
    this.logger.log(`[Mock DocuSign] Created envelope ${envelopeId} for document ${request.documentName}`);
    return {
      envelopeId,
      signingUrl: `https://demo.docusign.net/Signing/MTRedeem/v1/${envelopeId}`,
      status: 'sent',
    };
  }

  private async realCreateEnvelope(request: SigningRequest): Promise<SigningResult> {
    /**
     * Phase 2: Real DocuSign eSignature API.
     *
     * Flow:
     * 1. Authenticate via DocuSign JWT Grant
     * 2. Fetch document from S3
     * 3. Create envelope with signers
     * 4. Return embedded signing URL
     * 5. Handle DocuSign Connect webhook for completion
     */
    throw new Error('Real DocuSign integration not yet implemented. Set DOCUSIGN_MOCK_MODE=true for MVP.');
  }
}
