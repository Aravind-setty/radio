import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

enum StreamType {
    EXTERNAL = 'EXTERNAL',
    BROWSER = 'BROWSER',
}

export class CreateStreamDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    genre?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(StreamType)
    @IsOptional()
    type?: StreamType;

    @IsString()
    @IsOptional()
    streamUrl?: string; // Optional because BROWSER streams generate dynamic IDs/URLs
}
