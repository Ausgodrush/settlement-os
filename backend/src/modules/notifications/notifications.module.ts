import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsController } from './notifications.controller';
import { Notification } from '../../database/entities/notification.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { User } from '../../database/entities/user.entity';

const IS_DEMO = process.env.DEMO_MODE === 'true';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, DealParty, User]),
    ...(IS_DEMO ? [] : [BullModule.registerQueue({ name: 'notifications' })]),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    ...(IS_DEMO ? [] : [NotificationsProcessor]),
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
