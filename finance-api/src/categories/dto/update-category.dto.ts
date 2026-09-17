import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(['NEED', 'WANT', 'UNASSIGNED'])
  group?: string;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
