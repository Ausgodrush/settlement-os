import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemoSeeder } from './demo-seeder';
import { User } from '../../database/entities/user.entity';
import { Deal } from '../../database/entities/deal.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { Condition } from '../../database/entities/condition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Deal, DealParty, Condition])],
  providers: [DemoSeeder],
})
export class DemoModule {}
