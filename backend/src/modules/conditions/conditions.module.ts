import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConditionsController } from './conditions.controller';
import { ConditionsService } from './conditions.service';
import { ConditionEngineService } from './condition-engine.service';
import { Condition } from '../../database/entities/condition.entity';
import { Deal } from '../../database/entities/deal.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { Document } from '../../database/entities/document.entity';
import { AuditModule } from '../audit/audit.module';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Condition, Deal, DealParty, Document]),
    AuditModule,
    WebsocketsModule,
  ],
  controllers: [ConditionsController],
  providers: [ConditionsService, ConditionEngineService],
  exports: [ConditionsService, ConditionEngineService],
})
export class ConditionsModule {}
