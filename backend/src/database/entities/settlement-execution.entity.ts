import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn,
} from 'typeorm';
import { Deal } from './deal.entity';
import { User } from './user.entity';

export enum ExecutionStatus {
  PENDING = 'PENDING',
  VALIDATING = 'VALIDATING',
  APPROVED = 'APPROVED',
  EXECUTING = 'EXECUTING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('settlement_executions')
export class SettlementExecution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Deal)
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @Column({ type: 'enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'initiated_by' })
  initiatedBy: User;

  @Column({ name: 'validated_at', type: 'timestamptz', nullable: true })
  validatedAt: Date;

  @Column({ name: 'validation_result', type: 'jsonb', nullable: true })
  validationResult: Record<string, any>;

  @Column({ name: 'pexa_workspace_id', length: 100, nullable: true })
  pexaWorkspaceId: string;

  @Column({ name: 'pexa_lodgement_ref', length: 100, nullable: true })
  pexaLodgementRef: string;

  @Column({ name: 'pexa_triggered_at', type: 'timestamptz', nullable: true })
  pexaTriggeredAt: Date;

  @Column({ name: 'escrow_released', default: false })
  escrowReleased: boolean;

  @Column({ name: 'escrow_released_at', type: 'timestamptz', nullable: true })
  escrowReleasedAt: Date;

  @Column({ name: 'escrow_tx_hash', length: 100, nullable: true })
  escrowTxHash: string;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
