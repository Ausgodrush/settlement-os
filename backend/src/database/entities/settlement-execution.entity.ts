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

  @Column({ type: 'simple-enum', enum: ExecutionStatus, default: ExecutionStatus.PENDING })
  status: ExecutionStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'initiated_by' })
  initiatedBy: User;

  @Column({ name: 'validated_at', nullable: true })
  validatedAt: Date;

  @Column({ name: 'validation_result', type: 'simple-json', nullable: true })
  validationResult: Record<string, any>;

  @Column({ name: 'pexa_workspace_id', length: 100, nullable: true })
  pexaWorkspaceId: string;

  @Column({ name: 'pexa_lodgement_ref', length: 100, nullable: true })
  pexaLodgementRef: string;

  @Column({ name: 'pexa_triggered_at', nullable: true })
  pexaTriggeredAt: Date;

  @Column({ name: 'escrow_released', default: false })
  escrowReleased: boolean;

  @Column({ name: 'escrow_released_at', nullable: true })
  escrowReleasedAt: Date;

  @Column({ name: 'escrow_tx_hash', length: 100, nullable: true })
  escrowTxHash: string;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
