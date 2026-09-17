import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

export class SingleAllocationItemDto {
  @IsInt()
  targetGoalId: number;

  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer string > 0' })
  amount: string;
}

export class AllocateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleAllocationItemDto)
  allocations: SingleAllocationItemDto[];

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
