import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index, Unique,
} from 'typeorm';
import { Deal } from './deal.entity';
import { User } from './user.entity';

export enum PartyRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  BUYER_CONVEYANCER = 'BUYER_CONVEYANCER',
  SELLER_CONVEYANCER = 'SELLER_CONVEYANCER',
  AGENT = 'AGENT',
}

@Entity('deal_parties')
@Unique(['deal', 'partyRole'])
export class DealParty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @Index()
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'party_role', type: 'simple-enum', enum: PartyRole })
  partyRole: PartyRole;

  @Column({ name: 'invited_at', nullable: true })
  invitedAt: Date;

  @Column({ name: 'accepted_at', nullable: true })
  acceptedAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
