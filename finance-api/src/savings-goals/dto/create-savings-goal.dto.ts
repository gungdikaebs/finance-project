import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class CreateSavingsGoalDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(['EMERGENCY', 'UNASSIGNED', 'PURCHASE'])
  type: 'EMERGENCY' | 'UNASSIGNED' | 'PURCHASE';

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'targetAmount must be a positive integer string' })
  targetAmount?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  targetMonths?: number;

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'priceReference must be a positive integer string' })
  priceReference?: string;

  @IsOptional()
  @IsString()
  referenceDate?: string;

  @IsOptional()
  @IsEnum(['FULL', 'DOWN_PAYMENT'])
  mode?: 'FULL' | 'DOWN_PAYMENT';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  annualPriceIncreaseRatio?: number;
}
