import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;
}

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 100)
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  refresh_token: string;
}
