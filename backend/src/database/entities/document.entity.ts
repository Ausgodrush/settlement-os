import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Deal } from './deal.entity';
import { User } from './user.entity';

export enum DocType {
  CONTRACT = 'CONTRACT',
  ID_VERIFICATION = 'ID_VERIFICATION',
  FINANCE_APPROVAL = 'FINANCE_APPROVAL',
  BUILDING_INSPECTION = 'BUILDING_INSPECTION',
  PEST_INSPECTION = 'PEST_INSPECTION',
  TITLE_SEARCH = 'TITLE_SEARCH',
  DISCHARGE_MORTGAGE = 'DISCHARGE_MORTGAGE',
  TRANSFER = 'TRANSFER',
  SETTLEMENT_STATEMENT = 'SETTLEMENT_STATEMENT',
  DISCLOSURE = 'DISCLOSURE',
  OTHER = 'OTHER',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Deal, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'deal_id' })
  deal: Deal;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by' })
  uploadedBy: User;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'original_filename', length: 255 })
  originalFilename: string;

  @Index()
  @Column({ name: 'doc_type', type: 'simple-enum', enum: DocType })
  docType: DocType;

  @Column({ name: 's3_bucket', length: 255 })
  s3Bucket: string;

  @Column({ name: 's3_key', length: 500 })
  s3Key: string;

  @Column({ name: 'file_size_bytes', type: 'bigint', nullable: true })
  fileSizeBytes: number;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string;

  @Column({ name: 'checksum_sha256', length: 64, nullable: true })
  checksumSha256: string;

  @Column({ name: 'is_signed', default: false })
  isSigned: boolean;

  @Column({ name: 'docusign_envelope_id', length: 100, nullable: true })
  docusignEnvelopeId: string;

  @Column({ default: false })
  verified: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: User;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
