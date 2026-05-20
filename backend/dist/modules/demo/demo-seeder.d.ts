import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Deal } from '../../database/entities/deal.entity';
import { DealParty } from '../../database/entities/deal-party.entity';
import { Condition } from '../../database/entities/condition.entity';
export declare class DemoSeeder implements OnApplicationBootstrap {
    private readonly usersRepo;
    private readonly dealsRepo;
    private readonly partiesRepo;
    private readonly conditionsRepo;
    private readonly logger;
    constructor(usersRepo: Repository<User>, dealsRepo: Repository<Deal>, partiesRepo: Repository<DealParty>, conditionsRepo: Repository<Condition>);
    onApplicationBootstrap(): Promise<void>;
    private seed;
}
