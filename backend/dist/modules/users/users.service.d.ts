import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
export declare class UpdateProfileDto {
    firstName?: string;
    lastName?: string;
    phone?: string;
    firmName?: string;
}
export declare class UsersService {
    private readonly usersRepo;
    constructor(usersRepo: Repository<User>);
    findAll(role?: UserRole): Promise<any[]>;
    findById(id: string): Promise<any>;
    updateProfile(id: string, dto: UpdateProfileDto): Promise<any>;
    private sanitize;
}
