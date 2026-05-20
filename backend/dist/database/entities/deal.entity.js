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
exports.Deal = exports.DealStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var DealStatus;
(function (DealStatus) {
    DealStatus["INIT"] = "INIT";
    DealStatus["ACTIVE"] = "ACTIVE";
    DealStatus["READY"] = "READY";
    DealStatus["SETTLED"] = "SETTLED";
    DealStatus["CANCELLED"] = "CANCELLED";
})(DealStatus || (exports.DealStatus = DealStatus = {}));
let Deal = class Deal {
};
exports.Deal = Deal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Deal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ name: 'reference_no', length: 20 }),
    __metadata("design:type", String)
], Deal.prototype, "referenceNo", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'simple-enum', enum: DealStatus, default: DealStatus.INIT }),
    __metadata("design:type", String)
], Deal.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_address', type: 'text' }),
    __metadata("design:type", String)
], Deal.prototype, "propertyAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_suburb', length: 100 }),
    __metadata("design:type", String)
], Deal.prototype, "propertySuburb", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_state', length: 10, default: 'SA' }),
    __metadata("design:type", String)
], Deal.prototype, "propertyState", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_postcode', length: 10 }),
    __metadata("design:type", String)
], Deal.prototype, "propertyPostcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'title_reference', length: 50, nullable: true }),
    __metadata("design:type", String)
], Deal.prototype, "titleReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'land_services_ref', length: 50, nullable: true }),
    __metadata("design:type", String)
], Deal.prototype, "landServicesRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'purchase_price', type: 'numeric', precision: 14, scale: 2 }),
    __metadata("design:type", Number)
], Deal.prototype, "purchasePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deposit_amount', type: 'numeric', precision: 14, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Deal.prototype, "depositAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deposit_paid', default: false }),
    __metadata("design:type", Boolean)
], Deal.prototype, "depositPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deposit_paid_at', nullable: true }),
    __metadata("design:type", Date)
], Deal.prototype, "depositPaidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'contract_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Deal.prototype, "contractDate", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'settlement_date', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Deal.prototype, "settlementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_settled_at', nullable: true }),
    __metadata("design:type", Date)
], Deal.prototype, "actualSettledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pexa_workspace_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], Deal.prototype, "pexaWorkspaceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'pexa_status', length: 50, nullable: true }),
    __metadata("design:type", String)
], Deal.prototype, "pexaStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Deal.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], Deal.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Deal.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Deal.prototype, "updatedAt", void 0);
exports.Deal = Deal = __decorate([
    (0, typeorm_1.Entity)('deals')
], Deal);
//# sourceMappingURL=deal.entity.js.map