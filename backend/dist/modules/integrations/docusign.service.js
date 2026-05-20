"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DocuSignService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocuSignService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let DocuSignService = DocuSignService_1 = class DocuSignService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(DocuSignService_1.name);
        this.mockMode = config.get('DOCUSIGN_MOCK_MODE', 'true') === 'true';
    }
    async createEnvelope(request) {
        if (this.mockMode) {
            return this.mockCreateEnvelope(request);
        }
        return this.realCreateEnvelope(request);
    }
    async getEnvelopeStatus(envelopeId) {
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
    async mockCreateEnvelope(request) {
        await new Promise((r) => setTimeout(r, 300));
        const envelopeId = `ENV-MOCK-${Date.now()}`;
        this.logger.log(`[Mock DocuSign] Created envelope ${envelopeId} for document ${request.documentName}`);
        return {
            envelopeId,
            signingUrl: `https://demo.docusign.net/Signing/MTRedeem/v1/${envelopeId}`,
            status: 'sent',
        };
    }
    async realCreateEnvelope(request) {
        throw new Error('Real DocuSign integration not yet implemented. Set DOCUSIGN_MOCK_MODE=true for MVP.');
    }
};
exports.DocuSignService = DocuSignService;
exports.DocuSignService = DocuSignService = DocuSignService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DocuSignService);
//# sourceMappingURL=docusign.service.js.map