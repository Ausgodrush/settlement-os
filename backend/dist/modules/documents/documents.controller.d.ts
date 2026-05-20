import { User } from '../../database/entities/user.entity';
import { DocType } from '../../database/entities/document.entity';
import { DocumentsService } from './documents.service';
declare class UploadDocDto {
    name: string;
    docType: DocType;
}
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    upload(dealId: string, file: Express.Multer.File, dto: UploadDocDto, user: User): Promise<import("../../database/entities/document.entity").Document>;
    findAll(dealId: string): Promise<(import("../../database/entities/document.entity").Document & {
        downloadUrl: string;
    })[]>;
    verify(dealId: string, docId: string, user: User): Promise<import("../../database/entities/document.entity").Document>;
    delete(dealId: string, docId: string, user: User): Promise<void>;
}
export {};
