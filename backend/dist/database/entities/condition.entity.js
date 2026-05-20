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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Condition = exports.ConditionStatus = exports.ConditionType = void 0;
const typeorm_1 = require("typeorm");
const deal_entity_1 = require("./deal.entity");
const user_entity_1 = require("./user.entity");
var ConditionType;
(function (ConditionType) {
    ConditionType["BOOLEAN_FLAG"] = "BOOLEAN_FLAG";
    ConditionType["DATE_DEADLINE"] = "DATE_DEADLINE";
    ConditionType["DOCUMENT_UPLOAD"] = "DOCUMENT_UPLOAD";
    ConditionType["EXTERNAL_CONFIRMATION"] = "EXTERNAL_CONFIRMATION";
    ConditionType["APPROVAL"] = "APPROVAL";
})(ConditionType || (exports.ConditionType = ConditionType = {}));
var ConditionStatus;
(function (ConditionStatus) {
    ConditionStatus["PENDING"] = "PENDING";
    ConditionStatus["MET"] = "MET";
    ConditionStatus["WAIVED"] = "WAIVED";
    ConditionStatus["FAILED"] = "FAILED";
})(ConditionStatus || (exports.ConditionStatus = ConditionStatus = {}));
let Condition = class Condition {
};
exports.Condition = Condition;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Condition.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => deal_entity_1.Deal, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'deal_id' }),
    __metadata("design:type", deal_entity_1.Deal)
], Condition.prototype, "deal", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Condition.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Condition.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'condition_type', type: 'simple-enum', enum: ConditionType }),
    __metadata("design:type", String)
], Condition.prototype, "conditionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rule_json', type: 'simple-json' }),
    __metadata("design:type", Object)
], Condition.prototype, "ruleJson", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ConditionStatus, default: ConditionStatus.PENDING }),
    __metadata("design:type", String)
], Condition.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to_role', length: 30, nullable: true }),
    __metadata("design:type", String)
], Condition.prototype, "assignedToRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evidence_doc_id', nullable: true }),
    __metadata("design:type", String)
], Condition.prototype, "evidenceDocId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'waived_by' }),
    __metadata("design:type", user_entity_1.User)
], Condition.prototype, "waivedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'waived_reason', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Condition.prototype, "waivedReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'met_at', nullable: true }),
    __metadata("design:type", Date)
], Condition.prototype, "metAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evaluated_at', nullable: true }),
    __metadata("design:type", Date)
], Condition.prototype, "evaluatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Condition.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', default: 0 }),
    __metadata("design:type", Number)
], Condition.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Condition.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Condition.prototype, "updatedAt", void 0);
exports.Condition = Condition = __decorate([
    (0, typeorm_1.Entity)('conditions')
], Condition);
//# sourceMappingURL=condition.entity.js.map