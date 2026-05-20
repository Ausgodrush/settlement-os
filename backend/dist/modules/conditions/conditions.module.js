"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const conditions_controller_1 = require("./conditions.controller");
const conditions_service_1 = require("./conditions.service");
const condition_engine_service_1 = require("./condition-engine.service");
const condition_entity_1 = require("../../database/entities/condition.entity");
const deal_entity_1 = require("../../database/entities/deal.entity");
const deal_party_entity_1 = require("../../database/entities/deal-party.entity");
const document_entity_1 = require("../../database/entities/document.entity");
const audit_module_1 = require("../audit/audit.module");
const websockets_module_1 = require("../websockets/websockets.module");
let ConditionsModule = class ConditionsModule {
};
exports.ConditionsModule = ConditionsModule;
exports.ConditionsModule = ConditionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([condition_entity_1.Condition, deal_entity_1.Deal, deal_party_entity_1.DealParty, document_entity_1.Document]),
            audit_module_1.AuditModule,
            websockets_module_1.WebsocketsModule,
        ],
        controllers: [conditions_controller_1.ConditionsController],
        providers: [conditions_service_1.ConditionsService, condition_engine_service_1.ConditionEngineService],
        exports: [conditions_service_1.ConditionsService, condition_engine_service_1.ConditionEngineService],
    })
], ConditionsModule);
//# sourceMappingURL=conditions.module.js.map