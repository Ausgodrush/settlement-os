import { Module } from '@nestjs/common';
import { PexaService } from './pexa.service';
import { DocuSignService } from './docusign.service';

@Module({
  providers: [PexaService, DocuSignService],
  exports: [PexaService, DocuSignService],
})
export class IntegrationsModule {}
