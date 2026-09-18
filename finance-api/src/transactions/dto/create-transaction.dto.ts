import { IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer greater than 0' })
  amount: string;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsNotEmpty()
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsInt()
  incomeSourceId?: number;

  @IsOptional()
  @IsInt()
  paymentMethodId?: number;

  @IsOptional()
  @IsInt()
  sourceGoalId?: number;
}
