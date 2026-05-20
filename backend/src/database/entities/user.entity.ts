import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, OneToMany, Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  BUYER_CONVEYANCER = 'BUYER_CONVEYANCER',
  SELLER_CONVEYANCER = 'SELLER_CONVEYANCER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email: string;

  @Exclude()
  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Index()
  @Column({ type: 'simple-enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'firm_name', length: 255, nullable: true })
  firmName: string;

  @Column({ name: 'license_no', length: 100, nullable: true })
  licenseNo: string;

  @Exclude()
  @Column({ name: 'mfa_secret', length: 255, nullable: true })
  mfaSecret: string;

  @Column({ name: 'mfa_enabled', default: false })
  mfaEnabled: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
