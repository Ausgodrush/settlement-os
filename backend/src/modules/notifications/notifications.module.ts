import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsController } from './notifications.controller';
import { Notification } from '../../database/entities/notification.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, DealParty, User]),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
