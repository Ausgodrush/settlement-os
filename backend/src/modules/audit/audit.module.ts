import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { ActivityService } from './activity.service';
import { AuditController } from './audit.controller';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { Activity } from '../../database/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, Activity])],
  controllers: [AuditController],
  providers: [AuditService, ActivityService],
  exports: [AuditService, ActivityService],
})
export class AuditModule {}
