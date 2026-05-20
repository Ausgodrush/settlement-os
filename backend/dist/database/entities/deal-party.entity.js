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
exports.DealParty = exports.PartyRole = void 0;
const typeorm_1 = require("typeorm");
const deal_entity_1 = require("./deal.entity");
const user_entity_1 = require("./user.entity");
var PartyRole;
(function (PartyRole) {
    PartyRole["BUYER"] = "BUYER";
    PartyRole["SELLER"] = "SELLER";
    PartyRole["BUYER_CONVEYANCER"] = "BUYER_CONVEYANCER";
    PartyRole["SELLER_CONVEYANCER"] = "SELLER_CONVEYANCER";
    PartyRole["AGENT"] = "AGENT";
})(PartyRole || (exports.PartyRole = PartyRole = {}));
let DealParty = class DealParty {
};
exports.DealParty = DealParty;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DealParty.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => deal_entity_1.Deal, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'deal_id' }),
    __metadata("design:type", deal_entity_1.Deal)
], DealParty.prototype, "deal", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], DealParty.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'party_role', type: 'simple-enum', enum: PartyRole }),
    __metadata("design:type", String)
], DealParty.prototype, "partyRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'invited_at', nullable: true }),
    __metadata("design:type", Date)
], DealParty.prototype, "invitedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accepted_at', nullable: true }),
    __metadata("design:type", Date)
], DealParty.prototype, "acceptedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], DealParty.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], DealParty.prototype, "createdAt", void 0);
exports.DealParty = DealParty = __decorate([
    (0, typeorm_1.Entity)('deal_parties'),
    (0, typeorm_1.Unique)(['deal', 'partyRole'])
], DealParty);
//# sourceMappingURL=deal-party.entity.js.map