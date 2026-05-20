import { User } from '../../database/entities/user.entity';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: User): Promise<{
        data: import("../../database/entities/notification.entity").Notification[];
        unreadCount: number;
    }>;
    markRead(id: string, user: User): Promise<import("../../database/entities/notification.entity").Notification | null>;
}
