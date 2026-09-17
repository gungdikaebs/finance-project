import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SourceOverrideDto {
  @IsInt()
  incomeSourceId: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  needsRatio: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  savingsRatio: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  wantsRatio: number;
}

export class CreateBudgetPolicyDto {
  @IsInt()
  effectiveYear: number;

  @IsInt()
  @Min(1)
  @Max(12)
  effectiveMonth: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  needsRatio: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  savingsRatio: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  wantsRatio: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SourceOverrideDto)
  overrides?: SourceOverrideDto[];

  @IsOptional()
  @IsBoolean()
  applyToCurrentMonth?: boolean;
}
