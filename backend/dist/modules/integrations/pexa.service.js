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
var PexaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PexaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let PexaService = PexaService_1 = class PexaService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(PexaService_1.name);
        this.mockMode = config.get('PEXA_MOCK_MODE', 'true') === 'true';
    }
    async triggerSettlement(input) {
        if (this.mockMode) {
            return this.mockTriggerSettlement(input);
        }
        return this.realTriggerSettlement(input);
    }
    async getWorkspaceStatus(workspaceId) {
        if (this.mockMode) {
            return {
                workspaceId,
                status: 'READY_FOR_SETTLEMENT',
                lastUpdated: new Date(),
            };
        }
        throw new Error('Real PEXA not configured');
    }
    async createWorkspace(dealReference, settlementDate) {
        if (this.mockMode) {
            const workspaceId = `WS-MOCK-${Date.now()}`;
            this.logger.log(`[Mock PEXA] Created workspace ${workspaceId} for deal ${dealReference}`);
            return { workspaceId, status: 'CREATED' };
        }
        throw new Error('Real PEXA not configured');
    }
    async mockTriggerSettlement(input) {
        await new Promise((r) => setTimeout(r, 800));
        const lodgementRef = `SA-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
        this.logger.log(`[Mock PEXA] Settlement triggered for workspace ${input.workspaceId} | Lodgement: ${lodgementRef}`);
        return {
            workspaceId: input.workspaceId,
            lodgementRef,
            status: 'SETTLEMENT_COMPLETE',
            completedAt: new Date(),
        };
    }
    async realTriggerSettlement(input) {
        throw new Error('Real PEXA integration not yet implemented. Set PEXA_MOCK_MODE=true for MVP.');
    }
};
exports.PexaService = PexaService;
exports.PexaService = PexaService = PexaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PexaService);
//# sourceMappingURL=pexa.service.js.map