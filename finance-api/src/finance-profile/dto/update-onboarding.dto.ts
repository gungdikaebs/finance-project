import { IsOptional, IsBoolean, IsInt, Min, Max, IsString } from 'class-validator';

export class UpdateOnboardingDto {
  @IsOptional()
  @IsBoolean()
  isOnboardingCompleted?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  onboardingStep?: number;

  @IsOptional()
  @IsString()
  initialBalance?: string;

  @IsOptional()
  @IsString()
  monthlyNeeds?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  emergencyMonthsTarget?: number;
}
