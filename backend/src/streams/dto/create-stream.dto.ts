import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

enum StreamType {
  EXTERNAL = 'EXTERNAL',
  BROWSER = 'BROWSER',
}

export class CreateStreamDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Genre must not exceed 50 characters' })
  genre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsEnum(StreamType)
  @IsOptional()
  type?: StreamType;
}
