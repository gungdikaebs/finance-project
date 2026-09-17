import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateIncomeSourceDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
