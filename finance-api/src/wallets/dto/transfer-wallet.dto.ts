import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class TransferWalletDto {
  @IsNotEmpty({ message: 'Dompet sumber wajib ditentukan' })
  @IsInt()
  sourceWalletId: number;

  @IsNotEmpty({ message: 'Dompet tujuan wajib ditentukan' })
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
