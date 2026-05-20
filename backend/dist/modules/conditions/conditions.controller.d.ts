import { User } from '../../database/entities/user.entity';
import { ConditionsService, CreateConditionDto, UpdateConditionDto } from './conditions.service';
export declare class ConditionsController {
    private readonly conditionsService;
    constructor(conditionsService: ConditionsService);
    create(dealId: string, dto: CreateConditionDto, user: User): Promise<import("../../database/entities/condition.entity").Condition>;
    findAll(dealId: string): Promise<import("../../database/entities/condition.entity").Condition[]>;
    update(dealId: string, conditionId: string, dto: UpdateConditionDto, user: User): Promise<import("../../database/entities/condition.entity").Condition>;
    evaluate(dealId: string): Promise<import("./condition-engine.service").SettlementGateResult>;
}
