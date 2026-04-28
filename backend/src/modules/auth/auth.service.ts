import {
  Injectable, UnauthorizedException, ConflictException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../database/entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.usersRepo.create({ ...dto, passwordHash });
    await this.usersRepo.save(user);
    return this.buildTokenResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { email: dto.email, isActive: true } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    await this.usersRepo.update(user.id, { lastLoginAt: new Date() });
    return this.buildTokenResponse(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });
      const user = await this.usersRepo.findOne({ where: { id: payload.sub, isActive: true } });
      if (!user) throw new UnauthorizedException('User not found');
      const accessToken = this.signAccess(user);
      return { accessToken, expiresIn: 900 };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private buildTokenResponse(user: User) {
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

  private signAccess(user: User) {
    return this.jwtService.sign(
      { sub: user.id, email: user.email, role: user.role },
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') },
    );
  }

  private signRefresh(user: User) {
    return this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '7d') },
    );
  }
}
