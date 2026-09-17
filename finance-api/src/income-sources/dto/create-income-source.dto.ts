import { IsNotEmpty, IsString } from 'class-validator';

export class CreateIncomeSourceDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
