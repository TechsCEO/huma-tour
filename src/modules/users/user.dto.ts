import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsStrongPassword,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @IsString()
  name: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(['user', 'guide', 'lead-guide', 'admin'])
  role?: 'user' | 'guide' | 'lead-guide' | 'admin';

  @IsOptional()
  @IsString()
  photo?: string;

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
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ValidateIf(
    (o: UpdateUserDto) =>
      typeof o.password === 'string' && o.password.length > 0,
  )
  @IsString()
  passwordConfirm?: string;
}
