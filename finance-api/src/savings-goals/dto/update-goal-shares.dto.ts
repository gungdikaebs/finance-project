import { Type } from 'class-transformer';
import { IsArray, IsInt, Max, Min, ValidateNested } from 'class-validator';

export class SingleGoalShareDto {
  @IsInt()
  goalId: number;

  @IsInt()
  @Min(0)
  @Max(10000)
  shareRatio: number;
}

export class UpdateGoalSharesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SingleGoalShareDto)
  shares: SingleGoalShareDto[];
}
