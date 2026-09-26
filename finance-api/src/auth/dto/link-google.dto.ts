import { IsNotEmpty, IsString } from 'class-validator';

export class LinkGoogleDto {
  @IsString()
  @IsNotEmpty()
  credential: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
