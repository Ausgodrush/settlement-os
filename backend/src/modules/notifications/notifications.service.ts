import { Injectable, Logger } from '@nestjs/common';
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
    @InjectQueue('notifications') private readonly notifQueue: Queue,
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
        await this.notifQueue.add('send', { notificationId: notif.id }, { attempts: 3, backoff: 2000 });
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
