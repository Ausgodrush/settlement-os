import {
  IsString, IsNumber, IsOptional, IsDateString, IsEnum,
  IsUUID, Min, Max, Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DealStatus } from '../../../database/entities/deal.entity';
import { PartyRole } from '../../../database/entities/deal-party.entity';

export class CreateDealDto {
  @ApiProperty({ example: '14 Glenelg Street' })
  @IsString()
  propertyAddress: string;

  @ApiProperty({ example: 'Norwood' })
  @IsString()
  propertySuburb: string;

  @ApiProperty({ example: 'SA', default: 'SA' })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  propertyState?: string = 'SA';

  @ApiProperty({ example: '5067' })
  @IsString()
  @Length(4, 10)
  propertyPostcode: string;

  @ApiProperty({ example: 'CT 6142/456', required: false })
  @IsOptional()
  @IsString()
  titleReference?: string;

  @ApiProperty({ example: 850000 })
  @IsNumber()
  @Min(1)
  purchasePrice: number;

  @ApiProperty({ example: 85000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @ApiProperty({ example: '2024-03-15', required: false })
  @IsOptional()
  @IsDateString()
  contractDate?: string;

  @ApiProperty({ example: '2024-05-15', required: false })
  @IsOptional()
  @IsDateString()
  settlementDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDealDto {
  @IsOptional() @IsDateString() settlementDate?: string;
  @IsOptional() @IsString() titleReference?: string;
  @IsOptional() @IsString() landServicesRef?: string;
  @IsOptional() @IsString() pexaWorkspaceId?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() @Min(1) purchasePrice?: number;
}

export class UpdateDealStatusDto {
  @ApiProperty({ enum: DealStatus })
  @IsEnum(DealStatus)
  status: DealStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class AddPartyDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: PartyRole })
  @IsEnum(PartyRole)
  partyRole: PartyRole;
}

export class DealQueryDto {
  @IsOptional() @IsEnum(DealStatus) status?: DealStatus;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @Type(() => Number) @IsNumber() page?: number = 1;
  @IsOptional() @Type(() => Number) @IsNumber() limit?: number = 20;
}
