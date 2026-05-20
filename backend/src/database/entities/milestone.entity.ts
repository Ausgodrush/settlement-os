import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Deal } from './deal.entity';
import { User } from './user.entity';

export enum MilestoneType {
  CONTRACT_SIGNED = 'CONTRACT_SIGNED',
  DEPOSIT_PAID = 'DEPOSIT_PAID',
  FINANCE_APPROVED = 'FINANCE_APPROVED',
  INSPECTION_COMPLETE = 'INSPECTION_COMPLETE',
  TITLE_CHECKED = 'TITLE_CHECKED',
  DOCUMENTS_VERIFIED = 'DOCUMENTS_VERIFIED',
  SETTLEMENT_BOOKED = 'SETTLEMENT_BOOKED',
  KEYS_RELEASED = 'KEYS_RELEASED',
  SETTLED = 'SETTLED',
  CUSTOM = 'CUSTOM',
}

export enum MilestoneStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETE = 'COMPLETE',
  BLOCKED = 'BLOCKED',
}

@Entity('milestones')
export class Milestone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'milestone_type', type: 'simple-enum', enum: MilestoneType })
  milestoneType: MilestoneType;

  @Column({ type: 'simple-enum', enum: MilestoneStatus, default: MilestoneStatus.PENDING })
  status: MilestoneStatus;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'completed_by' })
  completedBy: User;

  @Column({ name: 'assigned_to_role', length: 30, nullable: true })
  assignedToRole: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
