import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../database/entities/user.entity';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() firstName?: string;
  @IsOptional() @IsString() lastName?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() firmName?: string;
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  async findAll(role?: UserRole) {
    const where = role ? { role, isActive: true } : { isActive: true };
    const users = await this.usersRepo.find({ where, order: { lastName: 'ASC' } });
    return users.map(this.sanitize);
  }

  async findById(id: string) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    await this.usersRepo.save(user);
    return this.sanitize(user);
  }

  private sanitize(user: User) {
    const { passwordHash, mfaSecret, ...safe } = user as any;
    return safe;
  }
}
