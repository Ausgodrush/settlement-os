import { Deal } from './deal.entity';
import { User } from './user.entity';
export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    IN_APP = "IN_APP"
}
export declare enum NotificationStatus {
    PENDING = "PENDING",
    SENT = "SENT",
    FAILED = "FAILED",
    READ = "READ"
}
export declare class Notification {
    id: string;
    user: User;
    deal: Deal;
    title: string;
    message: string;
    channel: NotificationChannel;
    status: NotificationStatus;
    readAt: Date;
    sentAt: Date;
    errorMsg: string;
    providerId: string;
    createdAt: Date;
}
