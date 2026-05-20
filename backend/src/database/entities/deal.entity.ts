import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index,
} from 'typeorm';
import { User } from './user.entity';

export enum DealStatus {
  INIT = 'INIT',
  ACTIVE = 'ACTIVE',
  READY = 'READY',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
}

@Entity('deals')
export class Deal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ name: 'reference_no', length: 20 })
  referenceNo: string;

  @Index()
  @Column({ type: 'simple-enum', enum: DealStatus, default: DealStatus.INIT })
  status: DealStatus;

  @Column({ name: 'property_address', type: 'text' })
  propertyAddress: string;

  @Column({ name: 'property_suburb', length: 100 })
  propertySuburb: string;

  @Column({ name: 'property_state', length: 10, default: 'SA' })
  propertyState: string;

  @Column({ name: 'property_postcode', length: 10 })
  propertyPostcode: string;

  @Column({ name: 'title_reference', length: 50, nullable: true })
  titleReference: string;

  @Column({ name: 'land_services_ref', length: 50, nullable: true })
  landServicesRef: string;

  @Column({ name: 'purchase_price', type: 'numeric', precision: 14, scale: 2 })
  purchasePrice: number;

  @Column({ name: 'deposit_amount', type: 'numeric', precision: 14, scale: 2, nullable: true })
  depositAmount: number;

  @Column({ name: 'deposit_paid', default: false })
  depositPaid: boolean;

  @Column({ name: 'deposit_paid_at', nullable: true })
  depositPaidAt: Date;

  @Column({ name: 'contract_date', type: 'date', nullable: true })
  contractDate: Date;

  @Index()
  @Column({ name: 'settlement_date', type: 'date', nullable: true })
  settlementDate: Date;

  @Column({ name: 'actual_settled_at', nullable: true })
  actualSettledAt: Date;

  @Column({ name: 'pexa_workspace_id', length: 100, nullable: true })
  pexaWorkspaceId: string;

  @Column({ name: 'pexa_status', length: 50, nullable: true })
  pexaStatus: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
