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
exports.DealQueryDto = exports.AddPartyDto = exports.UpdateDealStatusDto = exports.UpdateDealDto = exports.CreateDealDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const deal_entity_1 = require("../../../database/entities/deal.entity");
const deal_party_entity_1 = require("../../../database/entities/deal-party.entity");
class CreateDealDto {
    constructor() {
        this.propertyState = 'SA';
    }
}
exports.CreateDealDto = CreateDealDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '14 Glenelg Street' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealDto.prototype, "propertyAddress", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Norwood' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealDto.prototype, "propertySuburb", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SA', default: 'SA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(2, 10),
    __metadata("design:type", String)
], CreateDealDto.prototype, "propertyState", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '5067' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(4, 10),
    __metadata("design:type", String)
], CreateDealDto.prototype, "propertyPostcode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CT 6142/456', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealDto.prototype, "titleReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 850000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateDealDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85000, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateDealDto.prototype, "depositAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-03-15', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDealDto.prototype, "contractDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-05-15', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDealDto.prototype, "settlementDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDealDto.prototype, "notes", void 0);
class UpdateDealDto {
}
exports.UpdateDealDto = UpdateDealDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateDealDto.prototype, "settlementDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDealDto.prototype, "titleReference", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDealDto.prototype, "landServicesRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDealDto.prototype, "pexaWorkspaceId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDealDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], UpdateDealDto.prototype, "purchasePrice", void 0);
class UpdateDealStatusDto {
}
exports.UpdateDealStatusDto = UpdateDealStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: deal_entity_1.DealStatus }),
    (0, class_validator_1.IsEnum)(deal_entity_1.DealStatus),
    __metadata("design:type", String)
], UpdateDealStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDealStatusDto.prototype, "reason", void 0);
class AddPartyDto {
}
exports.AddPartyDto = AddPartyDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AddPartyDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: deal_party_entity_1.PartyRole }),
    (0, class_validator_1.IsEnum)(deal_party_entity_1.PartyRole),
    __metadata("design:type", String)
], AddPartyDto.prototype, "partyRole", void 0);
class DealQueryDto {
    constructor() {
        this.page = 1;
        this.limit = 20;
    }
}
exports.DealQueryDto = DealQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(deal_entity_1.DealStatus),
    __metadata("design:type", String)
], DealQueryDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DealQueryDto.prototype, "search", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DealQueryDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], DealQueryDto.prototype, "limit", void 0);
//# sourceMappingURL=deals.dto.js.map