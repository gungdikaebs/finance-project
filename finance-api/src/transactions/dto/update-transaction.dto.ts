import { IsInt, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer greater than 0' })
  amount?: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsInt()
  incomeSourceId?: number;

  @IsOptional()
  @IsInt()
  walletAccountId?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
