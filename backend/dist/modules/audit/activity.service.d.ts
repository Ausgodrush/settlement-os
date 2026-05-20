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
export declare class ActivityService {
    private readonly activityRepo;
    constructor(activityRepo: Repository<Activity>);
    log(dto: LogActivityDto): Promise<Activity>;
    findByDeal(dealId: string, limit?: number, before?: Date): Promise<Activity[]>;
}
