import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Kata sandi tidak boleh kosong' })
  password: string;
}
