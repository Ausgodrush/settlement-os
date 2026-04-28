import {
  Controller, Get, Post, Patch, Delete, Body, Param, UseGuards,
  ParseUUIDPipe, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities/user.entity';
import { DocType } from '../../database/entities/document.entity';
import { DocumentsService } from './documents.service';

class UploadDocDto {
  @IsString() name: string;
  @IsEnum(DocType) docType: DocType;
}

class VerifyDocDto {
  verified: boolean;
}

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deals/:dealId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a document to a deal' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20 * 1024 * 1024 } }))
  upload(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocDto,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.upload(dealId, file, dto.docType, dto.name, user);
  }

  @Get()
  @ApiOperation({ summary: 'List documents for a deal' })
  findAll(@Param('dealId', ParseUUIDPipe) dealId: string) {
    return this.documentsService.findByDeal(dealId);
  }

  @Patch(':docId/verify')
  @ApiOperation({ summary: 'Verify a document (conveyancer only)' })
  verify(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.verify(dealId, docId, user);
  }

  @Delete(':docId')
  @ApiOperation({ summary: 'Soft-delete a document' })
  delete(
    @Param('dealId', ParseUUIDPipe) dealId: string,
    @Param('docId', ParseUUIDPipe) docId: string,
    @CurrentUser() user: User,
  ) {
    return this.documentsService.softDelete(dealId, docId, user);
  }
}
