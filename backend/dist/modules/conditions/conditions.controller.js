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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const conditions_service_1 = require("./conditions.service");
let ConditionsController = class ConditionsController {
    constructor(conditionsService) {
        this.conditionsService = conditionsService;
    }
    create(dealId, dto, user) {
        return this.conditionsService.create(dealId, dto, user);
    }
    findAll(dealId) {
        return this.conditionsService.findByDeal(dealId);
    }
    update(dealId, conditionId, dto, user) {
        return this.conditionsService.update(dealId, conditionId, dto, user);
    }
    evaluate(dealId) {
        return this.conditionsService.evaluate(dealId);
    }
};
exports.ConditionsController = ConditionsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add a condition to a deal' }),
    __param(0, (0, common_1.Param)('dealId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, conditions_service_1.CreateConditionDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ConditionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all conditions for a deal' }),
    __param(0, (0, common_1.Param)('dealId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConditionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':conditionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update condition status (mark met/waived)' }),
    __param(0, (0, common_1.Param)('dealId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('conditionId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, conditions_service_1.UpdateConditionDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], ConditionsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('evaluate'),
    (0, swagger_1.ApiOperation)({ summary: 'Run condition engine — check if settlement is allowed' }),
    __param(0, (0, common_1.Param)('dealId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConditionsController.prototype, "evaluate", null);
exports.ConditionsController = ConditionsController = __decorate([
    (0, swagger_1.ApiTags)('conditions'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('deals/:dealId/conditions'),
    __metadata("design:paramtypes", [conditions_service_1.ConditionsService])
], ConditionsController);
//# sourceMappingURL=conditions.controller.js.map