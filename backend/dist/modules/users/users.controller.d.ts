import { User, UserRole } from '../../database/entities/user.entity';
import { UsersService, UpdateProfileDto } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(role?: UserRole): Promise<any[]>;
    updateProfile(user: User, dto: UpdateProfileDto): Promise<any>;
    findOne(id: string): Promise<any>;
}
