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
exports.Activity = exports.ActivityEventType = void 0;
const typeorm_1 = require("typeorm");
const deal_entity_1 = require("./deal.entity");
const user_entity_1 = require("./user.entity");
var ActivityEventType;
(function (ActivityEventType) {
    ActivityEventType["COMMENT"] = "COMMENT";
    ActivityEventType["STATUS_CHANGED"] = "STATUS_CHANGED";
    ActivityEventType["CONDITION_MET"] = "CONDITION_MET";
    ActivityEventType["CONDITION_WAIVED"] = "CONDITION_WAIVED";
    ActivityEventType["DOCUMENT_UPLOADED"] = "DOCUMENT_UPLOADED";
    ActivityEventType["DOCUMENT_VERIFIED"] = "DOCUMENT_VERIFIED";
    ActivityEventType["PARTY_ADDED"] = "PARTY_ADDED";
    ActivityEventType["MILESTONE_COMPLETE"] = "MILESTONE_COMPLETE";
    ActivityEventType["SETTLEMENT_APPROVED"] = "SETTLEMENT_APPROVED";
    ActivityEventType["SETTLEMENT_EXECUTED"] = "SETTLEMENT_EXECUTED";
    ActivityEventType["SYSTEM"] = "SYSTEM";
})(ActivityEventType || (exports.ActivityEventType = ActivityEventType = {}));
let Activity = class Activity {
};
exports.Activity = Activity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Activity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => deal_entity_1.Deal, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'deal_id' }),
    __metadata("design:type", deal_entity_1.Deal)
], Activity.prototype, "deal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Activity.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_role', length: 30, nullable: true }),
    __metadata("design:type", String)
], Activity.prototype, "actorRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'event_type', type: 'simple-enum', enum: ActivityEventType }),
    __metadata("design:type", String)
], Activity.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Activity.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], Activity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_system', default: false }),
    __metadata("design:type", Boolean)
], Activity.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Activity.prototype, "createdAt", void 0);
exports.Activity = Activity = __decorate([
    (0, typeorm_1.Entity)('activities')
], Activity);
//# sourceMappingURL=activity.entity.js.map