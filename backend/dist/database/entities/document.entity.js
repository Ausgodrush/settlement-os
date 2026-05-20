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
exports.Document = exports.DocType = void 0;
const typeorm_1 = require("typeorm");
const deal_entity_1 = require("./deal.entity");
const user_entity_1 = require("./user.entity");
var DocType;
(function (DocType) {
    DocType["CONTRACT"] = "CONTRACT";
    DocType["ID_VERIFICATION"] = "ID_VERIFICATION";
    DocType["FINANCE_APPROVAL"] = "FINANCE_APPROVAL";
    DocType["BUILDING_INSPECTION"] = "BUILDING_INSPECTION";
    DocType["PEST_INSPECTION"] = "PEST_INSPECTION";
    DocType["TITLE_SEARCH"] = "TITLE_SEARCH";
    DocType["DISCHARGE_MORTGAGE"] = "DISCHARGE_MORTGAGE";
    DocType["TRANSFER"] = "TRANSFER";
    DocType["SETTLEMENT_STATEMENT"] = "SETTLEMENT_STATEMENT";
    DocType["DISCLOSURE"] = "DISCLOSURE";
    DocType["OTHER"] = "OTHER";
})(DocType || (exports.DocType = DocType = {}));
let Document = class Document {
};
exports.Document = Document;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Document.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.ManyToOne)(() => deal_entity_1.Deal, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'deal_id' }),
    __metadata("design:type", deal_entity_1.Deal)
], Document.prototype, "deal", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'uploaded_by' }),
    __metadata("design:type", user_entity_1.User)
], Document.prototype, "uploadedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'original_filename', length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "originalFilename", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'doc_type', type: 'simple-enum', enum: DocType }),
    __metadata("design:type", String)
], Document.prototype, "docType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 's3_bucket', length: 255 }),
    __metadata("design:type", String)
], Document.prototype, "s3Bucket", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 's3_key', length: 500 }),
    __metadata("design:type", String)
], Document.prototype, "s3Key", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'file_size_bytes', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], Document.prototype, "fileSizeBytes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mime_type', length: 100, nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'checksum_sha256', length: 64, nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "checksumSha256", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_signed', default: false }),
    __metadata("design:type", Boolean)
], Document.prototype, "isSigned", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'docusign_envelope_id', length: 100, nullable: true }),
    __metadata("design:type", String)
], Document.prototype, "docusignEnvelopeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Document.prototype, "verified", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'verified_by' }),
    __metadata("design:type", user_entity_1.User)
], Document.prototype, "verifiedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'verified_at', nullable: true }),
    __metadata("design:type", Date)
], Document.prototype, "verifiedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deleted_at', nullable: true }),
    __metadata("design:type", Date)
], Document.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Document.prototype, "createdAt", void 0);
exports.Document = Document = __decorate([
    (0, typeorm_1.Entity)('documents')
], Document);
//# sourceMappingURL=document.entity.js.map