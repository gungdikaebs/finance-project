import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Kata sandi harus mengandung kombinasi huruf besar, huruf kecil, dan angka',
  })
  password: string;
}

