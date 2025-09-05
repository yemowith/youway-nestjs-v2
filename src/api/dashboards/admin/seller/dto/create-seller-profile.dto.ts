import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class CreateSellerProfileDto {
  @ApiPropertyOptional({
    type: String,
    maxLength: 255,
    description: 'About the seller',
  })
  @IsOptional()
  @IsString()
  about?: string;

  @ApiPropertyOptional({ type: String, maxLength: 255 })
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ type: String, maxLength: 255 })
  @IsOptional()
  @IsString()
  educationInfo?: string;

  @ApiPropertyOptional({ type: String, maxLength: 255 })
  @IsOptional()
  @IsString()
  experienceInfo?: string;

  @ApiPropertyOptional({ type: String, maxLength: 255 })
  @IsOptional()
  @IsString()
  certificateInfo?: string;

  @ApiPropertyOptional({ type: String, maxLength: 255 })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({ type: String, maxLength: 255 })
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @ApiPropertyOptional({ type: String, maxLength: 10 })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ type: String, maxLength: 255 })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ type: [String], description: 'Therapy IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  therapies?: string[];

  @ApiPropertyOptional({ type: [String], description: 'TherapySchool IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  therapySchools?: string[];
}
