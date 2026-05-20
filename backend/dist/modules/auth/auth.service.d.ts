import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../../database/entities/user.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService {
    private readonly usersRepo;
    private readonly jwtService;
    private readonly config;
    constructor(usersRepo: Repository<User>, jwtService: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../../database/entities/user.entity").UserRole;
            firmName: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            role: import("../../database/entities/user.entity").UserRole;
            firmName: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    private buildTokenResponse;
    private signAccess;
    private signRefresh;
}
