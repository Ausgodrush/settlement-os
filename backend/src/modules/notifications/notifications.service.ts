import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationChannel, NotificationStatus } from '../../database/entities/notification.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { User } from '../../database/entities/user.entity';

export interface SendNotificationDto {
  userId: string;
  dealId?: string;
  title: string;
  message: string;
  channels?: NotificationChannel[];
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(DealParty) private readonly partiesRepo: Repository<DealParty>,
    // @Optional() allows this to be null in DEMO_MODE (no Bull/Redis required)
    @Optional() @InjectQueue('notifications') private readonly notifQueue: Queue | undefined,
    private readonly config: ConfigService,
  ) {}

  async send(dto: SendNotificationDto) {
    const channels = dto.channels || [NotificationChannel.IN_APP, NotificationChannel.EMAIL];

    const notifications = channels.map((channel) =>
      this.notifRepo.create({
        user: { id: dto.userId } as any,
        deal: dto.dealId ? ({ id: dto.dealId } as any) : undefined,
        title: dto.title,
        message: dto.message,
        channel,
        status: NotificationStatus.PENDING,
      }),
    );

    const saved = await this.notifRepo.save(notifications);

    for (const notif of saved) {
      if (notif.channel !== NotificationChannel.IN_APP) {
        if (this.notifQueue) {
          await this.notifQueue.add('send', { notificationId: notif.id }, { attempts: 3, backoff: 2000 });
        } else {
          this.logger.log(`[Demo] Notification "${notif.title}" logged (no queue in demo mode)`);
          notif.status = NotificationStatus.SENT;
          notif.sentAt = new Date();
          await this.notifRepo.save(notif);
        }
      }
    }

    return saved;
  }

  async notifyDealParties(dealId: string, payload: { title: string; message: string }) {
    const parties = await this.partiesRepo.find({
      where: { deal: { id: dealId }, isActive: true },
      relations: ['user'],
    });

    await Promise.all(
      parties.map((p) =>
        this.send({
          userId: p.user.id,
          dealId,
          title: payload.title,
          message: payload.message,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        }),
      ),
    );
  }

  async findForUser(userId: string) {
    const notifications = await this.notifRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    const unreadCount = notifications.filter((n) => !n.readAt).length;
    return { data: notifications, unreadCount };
  }

  async markRead(notificationId: string, userId: string) {
    const notif = await this.notifRepo.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notif) return null;
    notif.readAt = new Date();
    notif.status = NotificationStatus.READ;
    return this.notifRepo.save(notif);
  }
}
