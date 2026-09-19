import { IsNotEmpty, IsString, IsIn, IsOptional } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty({ message: 'Nama akun dompet / rekening wajib diisi' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Tipe akun wajib ditentukan' })
  @IsIn(['BANK', 'E_WALLET', 'CASH', 'INVESTMENT'], {
    message: 'Tipe akun harus BANK, E_WALLET, CASH, atau INVESTMENT',
  })
  type: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  initialBalance?: string;
}
