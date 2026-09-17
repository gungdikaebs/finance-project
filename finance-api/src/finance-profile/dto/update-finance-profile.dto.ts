import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateFinanceProfileDto {
  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'initialBalance must be a positive integer or zero string' })
  initialBalance?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'monthlyNeeds must be a positive integer or zero string' })
  monthlyNeeds?: string;
}
