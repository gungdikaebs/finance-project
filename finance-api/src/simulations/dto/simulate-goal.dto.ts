import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class SimulateGoalDto {
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, {
    message: 'priceReference must be a positive integer string',
  })
  priceReference: string;

  @IsOptional()
  @IsDateString({ strict: true })
  referenceDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  annualPriceIncreaseRatio?: number; // basis points, e.g. 500 = 5%

  @IsOptional()
  @Matches(/^[0-9]+$/, {
    message: 'currentSavings must be a non-negative integer string',
  })
  currentSavings?: string;

  @IsNotEmpty()
  @IsEnum(['FULL', 'DOWN_PAYMENT'])
  mode: 'FULL' | 'DOWN_PAYMENT';

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  dpPercent?: number; // basis points, e.g. 0 = 0%, 2000 = 20%

  @IsOptional()
  @Matches(/^[0-9]+$/, {
    message: 'dpAmount must be a non-negative integer string',
  })
  dpAmount?: string;

  @IsOptional()
  @Matches(/^[0-9]+$/, {
    message: 'initialFees must be a non-negative integer string',
  })
  initialFees?: string;

  @IsNotEmpty()
  @IsEnum(['MONTHLY_SAVINGS', 'TARGET_DATE'])
  calculationMode: 'MONTHLY_SAVINGS' | 'TARGET_DATE';

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(600)
  targetMonths?: number;

  @IsOptional()
  @Matches(/^[0-9]+$/, {
    message: 'monthlySavings must be a non-negative integer string',
  })
  monthlySavings?: string;
}
