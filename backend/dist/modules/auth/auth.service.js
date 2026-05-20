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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const user_entity_1 = require("../../database/entities/user.entity");
let AuthService = class AuthService {
    constructor(usersRepo, jwtService, config) {
        this.usersRepo = usersRepo;
        this.jwtService = jwtService;
        this.config = config;
    }
    async register(dto) {
        const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = this.usersRepo.create({ ...dto, passwordHash });
        await this.usersRepo.save(user);
        return this.buildTokenResponse(user);
    }
    async login(dto) {
        const user = await this.usersRepo.findOne({ where: { email: dto.email, isActive: true } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        await this.usersRepo.update(user.id, { lastLoginAt: new Date() });
        return this.buildTokenResponse(user);
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.config.get('JWT_SECRET'),
            });
            const user = await this.usersRepo.findOne({ where: { id: payload.sub, isActive: true } });
            if (!user)
                throw new common_1.UnauthorizedException('User not found');
            const accessToken = this.signAccess(user);
            return { accessToken, expiresIn: 900 };
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
    }
    buildTokenResponse(user) {
        const accessToken = this.signAccess(user);
        const refreshToken = this.signRefresh(user);
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                firmName: user.firmName,
            },
        };
    }
    signAccess(user) {
        return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') });
    }
    signRefresh(user) {
        return this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '7d') });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map