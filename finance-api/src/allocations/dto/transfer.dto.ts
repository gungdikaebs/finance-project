import { IsInt, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class TransferDto {
  @IsInt()
  sourceGoalId: number;

  @IsInt()
  targetGoalId: number;

  @IsNotEmpty()
  @Matches(/^[1-9][0-9]*$/, { message: 'amount must be a positive integer string > 0' })
  amount: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
