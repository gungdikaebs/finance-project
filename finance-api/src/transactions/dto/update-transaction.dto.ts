import { IsInt, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateTransactionDto {
  @IsOptional()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer greater than 0' })
  amount?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  incomeSourceId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  walletAccountId?: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
