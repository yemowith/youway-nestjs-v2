import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class FindPageBySlugDto {
  @ApiProperty({
    description: 'Page slug (URL-friendly identifier)',
    example: 'about-us',
    minLength: 1,
    maxLength: 255,
  })
  @IsString({ message: 'Slug must be a string' })
  @IsNotEmpty({ message: 'Slug is required' })
  @MinLength(1, { message: 'Slug must be at least 1 character long' })
  @MaxLength(255, { message: 'Slug cannot exceed 255 characters' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug can only contain lowercase letters, numbers, and hyphens',
  })
  slug: string;
}
