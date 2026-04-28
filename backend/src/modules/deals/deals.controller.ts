import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { DealsService } from './deals.service';
import {
  CreateDealDto, UpdateDealDto, UpdateDealStatusDto, AddPartyDto, DealQueryDto,
} from './dto/deals.dto';

@ApiTags('deals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new property deal' })
  create(@Body() dto: CreateDealDto, @CurrentUser() user: User) {
    return this.dealsService.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List deals for current user' })
  findAll(@Query() query: DealQueryDto, @CurrentUser() user: User) {
    return this.dealsService.findAll(query, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get full deal workspace data' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.dealsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update deal details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealDto,
    @CurrentUser() user: User,
  ) {
    return this.dealsService.update(id, dto, user);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Transition deal status' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDealStatusDto,
    @CurrentUser() user: User,
  ) {
    return this.dealsService.updateStatus(id, dto, user);
  }

  @Post(':id/parties')
  @ApiOperation({ summary: 'Add a party to the deal' })
  addParty(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddPartyDto,
    @CurrentUser() user: User,
  ) {
    return this.dealsService.addParty(id, dto, user);
  }

  @Post(':id/milestones/seed')
  @ApiOperation({ summary: 'Seed default milestones for a deal' })
  seedMilestones(@Param('id', ParseUUIDPipe) id: string) {
    return this.dealsService.seedDefaultMilestones(id);
  }
}
