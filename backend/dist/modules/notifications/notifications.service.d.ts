import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationChannel } from '../../database/entities/notification.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
export interface SendNotificationDto {
    userId: string;
    dealId?: string;
    title: string;
    message: string;
    channels?: NotificationChannel[];
}
export declare class NotificationsService {
    private readonly notifRepo;
    private readonly partiesRepo;
    private readonly notifQueue;
    private readonly config;
    private readonly logger;
    constructor(notifRepo: Repository<Notification>, partiesRepo: Repository<DealParty>, notifQueue: Queue | undefined, config: ConfigService);
    send(dto: SendNotificationDto): Promise<Notification[]>;
    notifyDealParties(dealId: string, payload: {
        title: string;
        message: string;
    }): Promise<void>;
    findForUser(userId: string): Promise<{
        data: Notification[];
        unreadCount: number;
    }>;
    markRead(notificationId: string, userId: string): Promise<Notification | null>;
}
