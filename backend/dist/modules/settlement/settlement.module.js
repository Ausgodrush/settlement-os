"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const settlement_controller_1 = require("./settlement.controller");
const settlement_service_1 = require("./settlement.service");
const deal_entity_1 = require("../../database/entities/deal.entity");
const deal_party_entity_1 = require("../../database/entities/deal-party.entity");
const settlement_execution_entity_1 = require("../../database/entities/settlement-execution.entity");
const conditions_module_1 = require("../conditions/conditions.module");
const audit_module_1 = require("../audit/audit.module");
const websockets_module_1 = require("../websockets/websockets.module");
const notifications_module_1 = require("../notifications/notifications.module");
const integrations_module_1 = require("../integrations/integrations.module");
let SettlementModule = class SettlementModule {
};
exports.SettlementModule = SettlementModule;
exports.SettlementModule = SettlementModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([deal_entity_1.Deal, deal_party_entity_1.DealParty, settlement_execution_entity_1.SettlementExecution]),
            conditions_module_1.ConditionsModule,
            audit_module_1.AuditModule,
            websockets_module_1.WebsocketsModule,
            notifications_module_1.NotificationsModule,
            integrations_module_1.IntegrationsModule,
        ],
        controllers: [settlement_controller_1.SettlementController],
        providers: [settlement_service_1.SettlementService],
        exports: [settlement_service_1.SettlementService],
    })
], SettlementModule);
//# sourceMappingURL=settlement.module.js.map