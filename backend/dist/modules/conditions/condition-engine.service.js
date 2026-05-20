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
var ConditionEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionEngineService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const condition_entity_1 = require("../../database/entities/condition.entity");
const document_entity_1 = require("../../database/entities/document.entity");
let ConditionEngineService = ConditionEngineService_1 = class ConditionEngineService {
    constructor(conditionsRepo, documentsRepo) {
        this.conditionsRepo = conditionsRepo;
        this.documentsRepo = documentsRepo;
        this.logger = new common_1.Logger(ConditionEngineService_1.name);
    }
    async evaluateDeal(dealId) {
        const conditions = await this.conditionsRepo.find({
            where: { deal: { id: dealId } },
            relations: ['deal'],
        });
        const results = await Promise.all(conditions.map((c) => this.evaluateCondition(c, dealId)));
        const blockers = results.filter((r) => !r.passed).map((r) => r.reason || r.name);
        const settlementAllowed = blockers.length === 0;
        return { dealId, settlementAllowed, conditions: results, blockers };
    }
    async evaluateCondition(condition, dealId) {
        if (condition.status === condition_entity_1.ConditionStatus.MET || condition.status === condition_entity_1.ConditionStatus.WAIVED) {
            return { conditionId: condition.id, name: condition.name, passed: true };
        }
        if (condition.status === condition_entity_1.ConditionStatus.FAILED) {
            return {
                conditionId: condition.id,
                name: condition.name,
                passed: false,
                reason: `${condition.name} has failed`,
            };
        }
        const rule = condition.ruleJson;
        switch (condition.conditionType) {
            case condition_entity_1.ConditionType.BOOLEAN_FLAG:
                return this.evaluateBooleanFlag(condition, rule);
            case condition_entity_1.ConditionType.DATE_DEADLINE:
                return this.evaluateDateDeadline(condition, rule);
            case condition_entity_1.ConditionType.DOCUMENT_UPLOAD:
                return this.evaluateDocumentUpload(condition, rule, dealId);
            case condition_entity_1.ConditionType.EXTERNAL_CONFIRMATION:
                return this.evaluateExternalConfirmation(condition, rule);
            case condition_entity_1.ConditionType.APPROVAL:
                return this.evaluateApproval(condition, rule);
            default:
                return { conditionId: condition.id, name: condition.name, passed: false, reason: 'Unknown condition type' };
        }
    }
    evaluateBooleanFlag(condition, rule) {
        const passed = condition.status === condition_entity_1.ConditionStatus.MET;
        return {
            conditionId: condition.id,
            name: condition.name,
            passed,
            reason: passed ? undefined : `${condition.name} has not been confirmed yet`,
        };
    }
    evaluateDateDeadline(condition, rule) {
        const deadline = condition.dueDate ? new Date(condition.dueDate) : null;
        if (!deadline) {
            return { conditionId: condition.id, name: condition.name, passed: true };
        }
        const now = new Date();
        const passed = now <= deadline;
        return {
            conditionId: condition.id,
            name: condition.name,
            passed,
            reason: passed ? undefined : `${condition.name} deadline of ${deadline.toLocaleDateString('en-AU')} has passed`,
        };
    }
    async evaluateDocumentUpload(condition, rule, dealId) {
        const requiredDocType = rule.required_doc_type;
        const verifiedRequired = rule.verified_required ?? false;
        const qb = this.documentsRepo
            .createQueryBuilder('doc')
            .where('doc.deal_id = :dealId', { dealId })
            .andWhere('doc.doc_type = :docType', { docType: requiredDocType })
            .andWhere('doc.deleted_at IS NULL');
        if (verifiedRequired)
            qb.andWhere('doc.verified = true');
        const doc = await qb.getOne();
        const passed = !!doc;
        return {
            conditionId: condition.id,
            name: condition.name,
            passed,
            reason: passed
                ? undefined
                : `${condition.name}: ${verifiedRequired ? 'verified ' : ''}document of type ${requiredDocType} not found`,
        };
    }
    evaluateExternalConfirmation(condition, rule) {
        const passed = condition.status === condition_entity_1.ConditionStatus.MET;
        return {
            conditionId: condition.id,
            name: condition.name,
            passed,
            reason: passed ? undefined : `${condition.name}: awaiting external confirmation`,
        };
    }
    evaluateApproval(condition, rule) {
        const passed = condition.status === condition_entity_1.ConditionStatus.MET;
        return {
            conditionId: condition.id,
            name: condition.name,
            passed,
            reason: passed ? undefined : `${condition.name}: approval from ${rule.approvers?.join(', ') ?? 'required party'} pending`,
        };
    }
};
exports.ConditionEngineService = ConditionEngineService;
exports.ConditionEngineService = ConditionEngineService = ConditionEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(condition_entity_1.Condition)),
    __param(1, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ConditionEngineService);
//# sourceMappingURL=condition-engine.service.js.map