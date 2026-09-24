import {
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  Matches,
} from 'class-validator';

export class CompleteSavingsGoalDto {
  @IsEnum(['SPEND', 'MARK_ONLY'])
  action: 'SPEND' | 'MARK_ONLY';

  @IsOptional()
  @Matches(/^[0-9]+$/, { message: 'amount must be a positive integer string' })
  amount?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  walletAccountId?: number;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsEnum(['RELEASE_TO_UNALLOCATED', 'KEEP_IN_GOAL'])
  excessAction?: 'RELEASE_TO_UNALLOCATED' | 'KEEP_IN_GOAL';
}
