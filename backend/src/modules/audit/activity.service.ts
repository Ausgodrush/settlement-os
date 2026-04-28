import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityEventType } from '../../database/entities/activity.entity';

export interface LogActivityDto {
  dealId: string;
  userId?: string;
  actorRole?: string;
  eventType: ActivityEventType;
  message: string;
  metadata?: Record<string, any>;
  isSystem?: boolean;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
  ) {}

  async log(dto: LogActivityDto): Promise<Activity> {
    const activity = this.activityRepo.create({
      deal: { id: dto.dealId } as any,
      user: dto.userId ? { id: dto.userId } as any : undefined,
      actorRole: dto.actorRole,
      eventType: dto.eventType,
      message: dto.message,
      metadata: dto.metadata,
      isSystem: dto.isSystem ?? false,
    });
    return this.activityRepo.save(activity);
  }

  async findByDeal(dealId: string, limit = 30, before?: Date) {
    const qb = this.activityRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user')
      .where('a.deal_id = :dealId', { dealId })
      .orderBy('a.created_at', 'DESC')
      .take(limit);

    if (before) qb.andWhere('a.created_at < :before', { before });
    return qb.getMany();
  }
}
