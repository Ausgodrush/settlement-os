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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const audit_service_1 = require("./audit.service");
const activity_service_1 = require("./activity.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const user_entity_1 = require("../../database/entities/user.entity");
const activity_entity_1 = require("../../database/entities/activity.entity");
const class_validator_1 = require("class-validator");
class AddCommentDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AddCommentDto.prototype, "message", void 0);
let AuditController = class AuditController {
    constructor(auditService, activityService) {
        this.auditService = auditService;
        this.activityService = activityService;
    }
    getAuditLog(dealId) {
        return this.auditService.findByDeal(dealId);
    }
    getActivities(dealId, limit = 30) {
        return this.activityService.findByDeal(dealId, +limit);
    }
    addComment(dealId, dto, user) {
        return this.activityService.log({
            dealId,
            userId: user.id,
            actorRole: user.role,
            eventType: activity_entity_1.ActivityEventType.COMMENT,
            message: dto.message,
        });
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('audit'),
    (0, swagger_1.ApiOperation)({ summary: 'Get audit log for a deal' }),
    __param(0, (0, common_1.Param)('dealId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getAuditLog", null);
__decorate([
    (0, common_1.Get)('activities'),
    (0, swagger_1.ApiOperation)({ summary: 'Get activity feed for a deal' }),
    __param(0, (0, common_1.Param)('dealId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "getActivities", null);
__decorate([
    (0, common_1.Post)('activities'),
    (0, swagger_1.ApiOperation)({ summary: 'Post a comment to the activity feed' }),
    __param(0, (0, common_1.Param)('dealId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AddCommentDto,
        user_entity_1.User]),
    __metadata("design:returntype", void 0)
], AuditController.prototype, "addComment", null);
exports.AuditController = AuditController = __decorate([
    (0, swagger_1.ApiTags)('activity'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('deals/:dealId'),
    __metadata("design:paramtypes", [audit_service_1.AuditService,
        activity_service_1.ActivityService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map