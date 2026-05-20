import { UserRole } from '../../../database/entities/user.entity';
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    firmName?: string;
    licenseNo?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
