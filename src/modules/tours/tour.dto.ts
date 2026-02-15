import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { User } from '../users/userModel';
import { PartialType } from '@nestjs/mapped-types';

class StartLocationDto {
  @IsOptional()
  @IsString()
  @IsEnum(['Point'])
  type?: 'Point';

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: number[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class LocationDto {
  @IsOptional()
  @IsString()
  @IsEnum(['Point'])
  type?: 'Point';

  @IsArray()
  @IsNumber({}, { each: true })
  coordinates: number[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  day?: number;
}

export class CreateTourDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsNumber()
  maxGroupSize: number;

  @IsString()
  @IsEnum(['easy', 'medium', 'difficult'])
  difficulty: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  ratingsAverage?: number;

  @IsOptional()
  @IsNumber()
  ratingsQuantity?: number;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  priceDisCount?: number;

  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  imageCover: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => Date)
  startDates?: Date[];

  @IsOptional()
  @IsBoolean()
  secretTour?: boolean;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  guides?: User[];

  @IsOptional()
  @ValidateNested()
  @Type(() => StartLocationDto)
  startLocation?: StartLocationDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  locations?: LocationDto[];
}

export class UpdateTourDto extends PartialType(CreateTourDto) {}
