import { IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer greater than 0' })
  amount: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsNotEmpty()
  @IsString()
  date: string;

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
  paymentMethodId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  walletAccountId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sourceGoalId?: number;
}
