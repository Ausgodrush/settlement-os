import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettlementController } from './settlement.controller';
import { SettlementService } from './settlement.service';
import { Deal } from '../../database/entities/deal.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { SettlementExecution } from '../../database/entities/settlement-execution.entity';
import { ConditionsModule } from '../conditions/conditions.module';
import { AuditModule } from '../audit/audit.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, DealParty, SettlementExecution]),
    ConditionsModule,
    AuditModule,
    WebsocketsModule,
    NotificationsModule,
    IntegrationsModule,
  ],
  controllers: [SettlementController],
  providers: [SettlementService],
  exports: [SettlementService],
})
export class SettlementModule {}
