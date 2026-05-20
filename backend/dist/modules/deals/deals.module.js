"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DealsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const deals_controller_1 = require("./deals.controller");
const deals_service_1 = require("./deals.service");
const deal_entity_1 = require("../../database/entities/deal.entity");
const deal_party_entity_1 = require("../../database/entities/deal-party.entity");
const condition_entity_1 = require("../../database/entities/condition.entity");
const milestone_entity_1 = require("../../database/entities/milestone.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const audit_module_1 = require("../audit/audit.module");
const websockets_module_1 = require("../websockets/websockets.module");
let DealsModule = class DealsModule {
};
exports.DealsModule = DealsModule;
exports.DealsModule = DealsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([deal_entity_1.Deal, deal_party_entity_1.DealParty, condition_entity_1.Condition, milestone_entity_1.Milestone, user_entity_1.User]),
            audit_module_1.AuditModule,
            websockets_module_1.WebsocketsModule,
        ],
        controllers: [deals_controller_1.DealsController],
        providers: [deals_service_1.DealsService],
        exports: [deals_service_1.DealsService],
    })
], DealsModule);
//# sourceMappingURL=deals.module.js.map