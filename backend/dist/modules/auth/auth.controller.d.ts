import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import { User } from '../../database/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        expiresIn: number;
    }>;
    me(user: User): {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: import("../../database/entities/user.entity").UserRole;
        phone: string;
        firmName: string;
        licenseNo: string;
    };
}
