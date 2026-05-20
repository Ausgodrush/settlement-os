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
exports.Milestone = exports.MilestoneStatus = exports.MilestoneType = void 0;
const typeorm_1 = require("typeorm");
const deal_entity_1 = require("./deal.entity");
const user_entity_1 = require("./user.entity");
var MilestoneType;
(function (MilestoneType) {
    MilestoneType["CONTRACT_SIGNED"] = "CONTRACT_SIGNED";
    MilestoneType["DEPOSIT_PAID"] = "DEPOSIT_PAID";
    MilestoneType["FINANCE_APPROVED"] = "FINANCE_APPROVED";
    MilestoneType["INSPECTION_COMPLETE"] = "INSPECTION_COMPLETE";
    MilestoneType["TITLE_CHECKED"] = "TITLE_CHECKED";
    MilestoneType["DOCUMENTS_VERIFIED"] = "DOCUMENTS_VERIFIED";
    MilestoneType["SETTLEMENT_BOOKED"] = "SETTLEMENT_BOOKED";
    MilestoneType["KEYS_RELEASED"] = "KEYS_RELEASED";
    MilestoneType["SETTLED"] = "SETTLED";
    MilestoneType["CUSTOM"] = "CUSTOM";
})(MilestoneType || (exports.MilestoneType = MilestoneType = {}));
var MilestoneStatus;
(function (MilestoneStatus) {
    MilestoneStatus["PENDING"] = "PENDING";
    MilestoneStatus["IN_PROGRESS"] = "IN_PROGRESS";
    MilestoneStatus["COMPLETE"] = "COMPLETE";
    MilestoneStatus["BLOCKED"] = "BLOCKED";
})(MilestoneStatus || (exports.MilestoneStatus = MilestoneStatus = {}));
let Milestone = class Milestone {
};
exports.Milestone = Milestone;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Milestone.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => deal_entity_1.Deal, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'deal_id' }),
    __metadata("design:type", deal_entity_1.Deal)
], Milestone.prototype, "deal", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], Milestone.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'milestone_type', type: 'simple-enum', enum: MilestoneType }),
    __metadata("design:type", String)
], Milestone.prototype, "milestoneType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: MilestoneStatus, default: MilestoneStatus.PENDING }),
    __metadata("design:type", String)
], Milestone.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'due_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Milestone.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], Milestone.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'completed_by' }),
    __metadata("design:type", user_entity_1.User)
], Milestone.prototype, "completedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to_role', length: 30, nullable: true }),
    __metadata("design:type", String)
], Milestone.prototype, "assignedToRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Milestone.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'display_order', default: 0 }),
    __metadata("design:type", Number)
], Milestone.prototype, "displayOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Milestone.prototype, "createdAt", void 0);
exports.Milestone = Milestone = __decorate([
    (0, typeorm_1.Entity)('milestones')
], Milestone);
//# sourceMappingURL=milestone.entity.js.map