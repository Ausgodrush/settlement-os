import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../database/entities/user.entity';

export class LoginDto {
  @ApiProperty({ example: 'john@firm.com.au' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securepassword123' })
  @IsString()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firmName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  licenseNo?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}
