import {
  IsDate,
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SigInDto {
  @IsString()
  username: string;

  @IsString()
  pass: string;
}

export class SignUpDto {
  @IsString()
  name: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @MinLength(8)
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must be at least 8 chars and include upper, lower, number, and symbol.',
    },
  )
  password: string;

  @IsString()
  passwordConfirm: string;

  @IsDate()
  passwordChangedAt?: Date = new Date();
}
