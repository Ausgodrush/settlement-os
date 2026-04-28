import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import { Notification, NotificationChannel, NotificationStatus } from '../../database/entities/notification.entity';
import { User } from '../../database/entities/user.entity';

@Processor('notifications')
export class NotificationsProcessor {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    @InjectRepository(Notification) private readonly notifRepo: Repository<Notification>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly config: ConfigService,
  ) {
    const apiKey = config.get('SENDGRID_API_KEY');
    if (apiKey) sgMail.setApiKey(apiKey);
  }

  @Process('send')
  async handleSend(job: Job<{ notificationId: string }>) {
    const { notificationId } = job.data;
    const notif = await this.notifRepo.findOne({
      where: { id: notificationId },
      relations: ['user'],
    });
    if (!notif) return;

    try {
      if (notif.channel === NotificationChannel.EMAIL) {
        await this.sendEmail(notif);
      } else if (notif.channel === NotificationChannel.SMS) {
        await this.sendSms(notif);
      }
      notif.status = NotificationStatus.SENT;
      notif.sentAt = new Date();
    } catch (err) {
      this.logger.error(`Failed to send notification ${notificationId}: ${err.message}`);
      notif.status = NotificationStatus.FAILED;
      notif.errorMsg = err.message;
    }
    await this.notifRepo.save(notif);
  }

  private async sendEmail(notif: Notification) {
    const fromEmail = this.config.get('SENDGRID_FROM_EMAIL', 'noreply@settlement-os.com.au');
    const fromName = this.config.get('SENDGRID_FROM_NAME', 'Settlement OS');
    const user = notif.user;

    if (this.config.get('NODE_ENV') === 'development') {
      this.logger.log(`[Mock Email] To: ${user.email} | Subject: ${notif.title} | Body: ${notif.message}`);
      return;
    }

    await sgMail.send({
      to: user.email,
      from: { email: fromEmail, name: fromName },
      subject: notif.title,
      text: notif.message,
      html: `<p>${notif.message}</p>`,
    });
  }

  private async sendSms(notif: Notification) {
    const user = notif.user;
    if (!user.phone) return;

    if (this.config.get('NODE_ENV') === 'development') {
      this.logger.log(`[Mock SMS] To: ${user.phone} | Message: ${notif.message}`);
      return;
    }

    // Twilio integration (production)
    const twilio = require('twilio');
    const client = twilio(
      this.config.get('TWILIO_ACCOUNT_SID'),
      this.config.get('TWILIO_AUTH_TOKEN'),
    );
    const result = await client.messages.create({
      body: `Settlement OS: ${notif.message}`,
      from: this.config.get('TWILIO_FROM_NUMBER'),
      to: user.phone,
    });
    notif.providerId = result.sid;
  }
}
