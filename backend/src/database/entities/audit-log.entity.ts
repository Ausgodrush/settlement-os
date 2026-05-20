import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Deal } from './deal.entity';
import { User } from './user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Index()
  @ManyToOne(() => Deal, { nullable: true })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @Index()
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({ length: 100 })
  action: string;

  @Column({ name: 'entity_type', length: 50, nullable: true })
  entityType: string;

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'old_value', type: 'simple-json', nullable: true })
  oldValue: Record<string, any>;

  @Column({ name: 'new_value', type: 'simple-json', nullable: true })
  newValue: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Index()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
