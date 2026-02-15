import { IsString } from 'class-validator';

export class SigInDto {
  @IsString()
  username: string;

  @IsString()
  pass: string;
}
