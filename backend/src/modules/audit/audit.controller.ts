import { Controller, Get, Post, Param, Query, Body, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AuditService } from './audit.service';
import { ActivityService } from './activity.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { ActivityEventType } from '../../database/entities/activity.entity';
import { IsString } from 'class-validator';

class AddCommentDto {
  @IsString() message: string;
}

@ApiTags('activity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals/:dealId')
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
    private readonly activityService: ActivityService,
  ) {}

  @Get('audit')
  @ApiOperation({ summary: 'Get audit log for a deal' })
  getAuditLog(@Param('dealId', ParseUUIDPipe) dealId: string) {
    return this.auditService.findByDeal(dealId);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get activity feed for a deal' })
  getActivities(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Query('limit') limit = 30,
  ) {
    return this.activityService.findByDeal(dealId, +limit);
  }

  @Post('activities')
  @ApiOperation({ summary: 'Post a comment to the activity feed' })
  addComment(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Body() dto: AddCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.activityService.log({
      dealId,
      userId: user.id,
      actorRole: user.role,
      eventType: ActivityEventType.COMMENT,
      message: dto.message,
    });
  }
}
