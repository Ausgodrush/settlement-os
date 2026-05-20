import { Job } from 'bull';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification } from '../../database/entities/notification.entity';
import { User } from '../../database/entities/user.entity';
export declare class NotificationsProcessor {
    private readonly notifRepo;
    private readonly usersRepo;
    private readonly config;
    private readonly logger;
    constructor(notifRepo: Repository<Notification>, usersRepo: Repository<User>, config: ConfigService);
    handleSend(job: Job<{
        notificationId: string;
    }>): Promise<void>;
    private sendEmail;
    private sendSms;
}
