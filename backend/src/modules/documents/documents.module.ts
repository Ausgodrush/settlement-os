import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from '../../database/entities/document.entity';
import { Deal } from '../../database/entities/deal.entity';
import { AuditModule } from '../audit/audit.module';
import { WebsocketsModule } from '../websockets/websockets.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, Deal]),
    AuditModule,
    WebsocketsModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
