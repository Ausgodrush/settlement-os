import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';

export interface LogAuditDto {
  dealId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(dto: LogAuditDto): Promise<void> {
    const entry = this.auditRepo.create({
      deal: dto.dealId ? { id: dto.dealId } as any : undefined,
      user: dto.userId ? { id: dto.userId } as any : undefined,
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId,
      oldValue: dto.oldValue,
      newValue: dto.newValue,
      metadata: dto.metadata,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
    });
    await this.auditRepo.save(entry);
  }

  async findByDeal(dealId: string, limit = 50) {
    return this.auditRepo.find({
      where: { deal: { id: dealId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
