import { IsOptional, IsString, IsIn } from 'class-validator';

export class UpdateWalletDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['BANK', 'E_WALLET', 'CASH', 'INVESTMENT'], {
    message: 'Tipe akun harus BANK, E_WALLET, CASH, atau INVESTMENT',
  })
  type?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
