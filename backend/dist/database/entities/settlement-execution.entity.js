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
exports.SettlementExecution = exports.ExecutionStatus = void 0;
const typeorm_1 = require("typeorm");
const deal_entity_1 = require("./deal.entity");
const user_entity_1 = require("./user.entity");
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus["PENDING"] = "PENDING";
    ExecutionStatus["VALIDATING"] = "VALIDATING";
    ExecutionStatus["APPROVED"] = "APPROVED";
    ExecutionStatus["EXECUTING"] = "EXECUTING";
    ExecutionStatus["COMPLETED"] = "COMPLETED";
    ExecutionStatus["FAILED"] = "FAILED";
})(ExecutionStatus || (exports.ExecutionStatus = ExecutionStatus = {}));
let SettlementExecution = class SettlementExecution {
};
exports.SettlementExecution = SettlementExecution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SettlementExecution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => deal_entity_1.Deal),
    (0, typeorm_1.JoinColumn)({ name: 'deal_id' }),
    __metadata("design:type", deal_entity_1.Deal)
], SettlementExecution.prototype, "deal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING }),
    __metadata("design:type", String)
], SettlementExecution.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'initiated_by' }),
    __metadata("design:type", user_entity_1.User)
], SettlementExecution.prototype, "initiatedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'validated_at', nullable: true }),
    __metadata("design:type", Date)
], SettlementExecution.prototype, "validatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'validation_result', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], SettlementExecution.prototype, "validationResult", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pexa_workspace_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], SettlementExecution.prototype, "pexaWorkspaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pexa_lodgement_ref', length: 100, nullable: true }),
    __metadata("design:type", String)
], SettlementExecution.prototype, "pexaLodgementRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pexa_triggered_at', nullable: true }),
    __metadata("design:type", Date)
], SettlementExecution.prototype, "pexaTriggeredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escrow_released', default: false }),
    __metadata("design:type", Boolean)
], SettlementExecution.prototype, "escrowReleased", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escrow_released_at', nullable: true }),
    __metadata("design:type", Date)
], SettlementExecution.prototype, "escrowReleasedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'escrow_tx_hash', length: 100, nullable: true }),
    __metadata("design:type", String)
], SettlementExecution.prototype, "escrowTxHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], SettlementExecution.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SettlementExecution.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SettlementExecution.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SettlementExecution.prototype, "updatedAt", void 0);
exports.SettlementExecution = SettlementExecution = __decorate([
    (0, typeorm_1.Entity)('settlement_executions')
], SettlementExecution);
//# sourceMappingURL=settlement-execution.entity.js.map