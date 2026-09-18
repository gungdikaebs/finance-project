import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  Min,
  Max,
  IsIn,
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
  @IsIn(['STEPPED_MORTGAGE', 'FLAT', 'ANNUITY'])
  loanType?: 'STEPPED_MORTGAGE' | 'FLAT' | 'ANNUITY';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fixedRate?: number; // Suku bunga tahunan (atau rate fixed)

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(360)
  fixedMonths?: number; // Durasi fixed (misal 36 bulan). Opsional jika flat/annuity

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  floatingRate?: number; // Suku bunga floating bertahap

  @IsOptional()
  @Matches(/^[0-9]+$/, {
    message: 'monthlyIncome must be a non-negative integer string',
  })
  monthlyIncome?: string;
}
