import { Controller, Get, Post, Patch, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { ConditionsService, CreateConditionDto, UpdateConditionDto } from './conditions.service';

@ApiTags('conditions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals/:dealId/conditions')
export class ConditionsController {
  constructor(private readonly conditionsService: ConditionsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a condition to a deal' })
  create(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body() dto: CreateConditionDto,
    @CurrentUser() user: User,
  ) {
    return this.conditionsService.create(dealId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List all conditions for a deal' })
  findAll(@Param('dealId', ParseUUIDPipe) dealId: string) {
    return this.conditionsService.findByDeal(dealId);
  }

  @Patch(':conditionId')
  @ApiOperation({ summary: 'Update condition status (mark met/waived)' })
  update(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Param('conditionId', ParseUUIDPipe) conditionId: string,
    @Body() dto: UpdateConditionDto,
    @CurrentUser() user: User,
  ) {
    return this.conditionsService.update(dealId, conditionId, dto, user);
  }

  @Post('evaluate')
  @ApiOperation({ summary: 'Run condition engine — check if settlement is allowed' })
  evaluate(@Param('dealId', ParseUUIDPipe) dealId: string) {
    return this.conditionsService.evaluate(dealId);
  }
}
