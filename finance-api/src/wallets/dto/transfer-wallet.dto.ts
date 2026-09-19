import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TransferWalletDto {
  @IsNotEmpty({ message: 'Dompet sumber wajib ditentukan' })
  @Type(() => Number)
  @IsInt()
  sourceWalletId: number;

  @IsNotEmpty({ message: 'Dompet tujuan wajib ditentukan' })
  @Type(() => Number)
  @IsInt()
  targetWalletId: number;

  @IsNotEmpty({ message: 'Nominal transfer wajib diisi' })
  @IsString()
  amount: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  date?: string;
}
