import { Controller, Post, Get, Body, Param, UseGuards, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { SettlementService, InitiateSettlementDto } from './settlement.service';

class ApproveSettlementDto {
  @IsOptional() @IsString() notes?: string;
}

@ApiTags('settlement')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals/:dealId/settlement')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if deal is ready to settle' })
  validate(@Param('dealId', ParseUUIDPipe) dealId: string) {
    return this.settlementService.validate(dealId);
  }

  @Post('approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Conveyancer approves deal for settlement (ACTIVE → READY)' })
  approve(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body() dto: ApproveSettlementDto,
    @CurrentUser() user: User,
  ) {
    return this.settlementService.approveForSettlement(dealId, user, dto.notes);
  }

  @Post('execute')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Execute settlement (READY → SETTLED)' })
  execute(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body() dto: InitiateSettlementDto,
    @CurrentUser() user: User,
  ) {
    return this.settlementService.execute(dealId, user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get settlement execution status' })
  getExecution(@Param('dealId', ParseUUIDPipe) dealId: string) {
    return this.settlementService.getExecution(dealId);
  }
}
