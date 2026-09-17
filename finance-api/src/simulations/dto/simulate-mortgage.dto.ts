import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  Min,
  Max,
} from 'class-validator';

export class SimulateMortgageDto {
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, {
    message: 'principal must be a positive integer string',
  })
  principal: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(360)
  tenorMonths: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fixedRate?: number; // wajib jika fixedMonths > 0

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(360)
  fixedMonths: number; // e.g. 36 months

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  floatingRate?: number; // wajib jika fixedMonths < tenorMonths

  @IsOptional()
  @Matches(/^[0-9]+$/, {
    message: 'monthlyIncome must be a non-negative integer string',
  })
  monthlyIncome?: string;
}
