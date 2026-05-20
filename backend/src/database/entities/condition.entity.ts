import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Deal } from './deal.entity';
import { User } from './user.entity';

export enum ConditionType {
  BOOLEAN_FLAG = 'BOOLEAN_FLAG',
  DATE_DEADLINE = 'DATE_DEADLINE',
  DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
  EXTERNAL_CONFIRMATION = 'EXTERNAL_CONFIRMATION',
  APPROVAL = 'APPROVAL',
}

export enum ConditionStatus {
  PENDING = 'PENDING',
  MET = 'MET',
  WAIVED = 'WAIVED',
  FAILED = 'FAILED',
}

@Entity('conditions')
export class Condition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'condition_type', type: 'simple-enum', enum: ConditionType })
  conditionType: ConditionType;

  @Column({ name: 'rule_json', type: 'simple-json' })
  ruleJson: Record<string, any>;

  @Index()
  @Column({ type: 'simple-enum', enum: ConditionStatus, default: ConditionStatus.PENDING })
  status: ConditionStatus;

  @Column({ name: 'assigned_to_role', length: 30, nullable: true })
  assignedToRole: string;

  @Column({ name: 'evidence_doc_id', type: 'uuid', nullable: true })
  evidenceDocId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'waived_by' })
  waivedBy: User;

  @Column({ name: 'waived_reason', type: 'text', nullable: true })
  waivedReason: string;

  @Column({ name: 'met_at', nullable: true })
  metAt: Date;

  @Column({ name: 'evaluated_at', nullable: true })
  evaluatedAt: Date;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
