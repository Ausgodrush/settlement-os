import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { Deal } from '../../database/entities/deal.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { Condition } from '../../database/entities/condition.entity';
import { Milestone } from '../../database/entities/milestone.entity';
import { User } from '../../database/entities/user.entity';
import { AuditModule } from '../audit/audit.module';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Deal, DealParty, Condition, Milestone, User]),
    AuditModule,
    WebsocketsModule,
  ],
  controllers: [DealsController],
  providers: [DealsService],
  exports: [DealsService],
})
export class DealsModule {}
