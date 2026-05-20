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
exports.ConditionsService = exports.UpdateConditionDto = exports.CreateConditionDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const condition_entity_1 = require("../../database/entities/condition.entity");
const deal_entity_1 = require("../../database/entities/deal.entity");
const user_entity_1 = require("../../database/entities/user.entity");
const deal_party_entity_1 = require("../../database/entities/deal-party.entity");
const audit_service_1 = require("../audit/audit.service");
const activity_service_1 = require("../audit/activity.service");
const websockets_gateway_1 = require("../websockets/websockets.gateway");
const condition_engine_service_1 = require("./condition-engine.service");
class CreateConditionDto {
}
exports.CreateConditionDto = CreateConditionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: condition_entity_1.ConditionType }),
    (0, class_validator_1.IsEnum)(condition_entity_1.ConditionType),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "conditionType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Object)
], CreateConditionDto.prototype, "ruleJson", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "assignedToRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "dueDate", void 0);
class UpdateConditionDto {
}
exports.UpdateConditionDto = UpdateConditionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(condition_entity_1.ConditionStatus),
    __metadata("design:type", String)
], UpdateConditionDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateConditionDto.prototype, "evidenceDocId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConditionDto.prototype, "waivedReason", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateConditionDto.prototype, "notes", void 0);
let ConditionsService = class ConditionsService {
    constructor(conditionsRepo, dealsRepo, partiesRepo, engine, auditService, activityService, gateway) {
        this.conditionsRepo = conditionsRepo;
        this.dealsRepo = dealsRepo;
        this.partiesRepo = partiesRepo;
        this.engine = engine;
        this.auditService = auditService;
        this.activityService = activityService;
        this.gateway = gateway;
    }
    async create(dealId, dto, user) {
        const deal = await this.dealsRepo.findOne({ where: { id: dealId } });
        if (!deal)
            throw new common_1.NotFoundException('Deal not found');
        const count = await this.conditionsRepo.count({ where: { deal: { id: dealId } } });
        const condition = this.conditionsRepo.create({
            ...dto,
            deal,
            status: condition_entity_1.ConditionStatus.PENDING,
            displayOrder: count + 1,
        });
        await this.conditionsRepo.save(condition);
        await this.auditService.log({
            dealId, userId: user.id, action: 'CONDITION_CREATED',
            entityType: 'condition', entityId: condition.id, newValue: dto,
        });
        return condition;
    }
    async findByDeal(dealId) {
        return this.conditionsRepo.find({
            where: { deal: { id: dealId } },
            order: { displayOrder: 'ASC' },
        });
    }
    async update(dealId, conditionId, dto, user) {
        const condition = await this.conditionsRepo.findOne({
            where: { id: conditionId, deal: { id: dealId } },
        });
        if (!condition)
            throw new common_1.NotFoundException('Condition not found');
        const oldStatus = condition.status;
        if (dto.status === condition_entity_1.ConditionStatus.MET) {
            this.assertCanMarkMet(condition, user);
            condition.status = condition_entity_1.ConditionStatus.MET;
            condition.metAt = new Date();
            if (dto.evidenceDocId)
                condition.evidenceDocId = dto.evidenceDocId;
        }
        else if (dto.status === condition_entity_1.ConditionStatus.WAIVED) {
            if (![user_entity_1.UserRole.BUYER_CONVEYANCER, user_entity_1.UserRole.SELLER_CONVEYANCER, user_entity_1.UserRole.ADMIN].includes(user.role)) {
                throw new common_1.ForbiddenException('Only conveyancers can waive conditions');
            }
            condition.status = condition_entity_1.ConditionStatus.WAIVED;
            condition.waivedBy = user;
            if (dto.waivedReason)
                condition.waivedReason = dto.waivedReason;
        }
        condition.evaluatedAt = new Date();
        await this.conditionsRepo.save(condition);
        if (oldStatus !== condition.status) {
            const eventType = condition.status === condition_entity_1.ConditionStatus.MET
                ? 'CONDITION_MET' : 'CONDITION_WAIVED';
            await this.activityService.log({
                dealId, userId: user.id, eventType: eventType,
                message: `${user.fullName} marked "${condition.name}" as ${condition.status}`,
            });
            this.gateway.emitToDeal(dealId, 'condition:updated', {
                dealId, conditionId, status: condition.status,
            });
        }
        return condition;
    }
    async evaluate(dealId) {
        return this.engine.evaluateDeal(dealId);
    }
    assertCanMarkMet(condition, user) {
        if (user.role === user_entity_1.UserRole.ADMIN)
            return;
        if (!condition.assignedToRole)
            return;
        const allowed = condition.assignedToRole.toLowerCase().includes('conveyancer')
            ? [user_entity_1.UserRole.BUYER_CONVEYANCER, user_entity_1.UserRole.SELLER_CONVEYANCER]
            : condition.assignedToRole.toLowerCase().includes('buyer')
                ? [user_entity_1.UserRole.BUYER, user_entity_1.UserRole.BUYER_CONVEYANCER]
                : condition.assignedToRole.toLowerCase().includes('seller')
                    ? [user_entity_1.UserRole.SELLER, user_entity_1.UserRole.SELLER_CONVEYANCER]
                    : Object.values(user_entity_1.UserRole);
        if (!allowed.includes(user.role)) {
            throw new common_1.ForbiddenException(`Only ${condition.assignedToRole} can mark this condition as met`);
        }
    }
};
exports.ConditionsService = ConditionsService;
exports.ConditionsService = ConditionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(condition_entity_1.Condition)),
    __param(1, (0, typeorm_1.InjectRepository)(deal_entity_1.Deal)),
    __param(2, (0, typeorm_1.InjectRepository)(deal_party_entity_1.DealParty)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        condition_engine_service_1.ConditionEngineService,
        audit_service_1.AuditService,
        activity_service_1.ActivityService,
        websockets_gateway_1.WebsocketsGateway])
], ConditionsService);
//# sourceMappingURL=conditions.service.js.map