import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Deal } from './deal.entity';
import { User } from './user.entity';

export enum ActivityEventType {
  COMMENT = 'COMMENT',
  STATUS_CHANGED = 'STATUS_CHANGED',
  CONDITION_MET = 'CONDITION_MET',
  CONDITION_WAIVED = 'CONDITION_WAIVED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED',
  PARTY_ADDED = 'PARTY_ADDED',
  MILESTONE_COMPLETE = 'MILESTONE_COMPLETE',
  SETTLEMENT_APPROVED = 'SETTLEMENT_APPROVED',
  SETTLEMENT_EXECUTED = 'SETTLEMENT_EXECUTED',
  SYSTEM = 'SYSTEM',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'actor_role', length: 30, nullable: true })
  actorRole: string;

  @Column({ name: 'event_type', type: 'enum', enum: ActivityEventType })
  eventType: ActivityEventType;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'is_system', default: false })
  isSystem: boolean;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
