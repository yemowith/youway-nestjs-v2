import {
  IsNumber,
  IsString,
  IsDate,
  IsArray,
  IsOptional,
} from 'class-validator';

export class UserRatingDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}

export class CommentRatingDto {
  @IsString()
  id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  stars?: number;

  @IsDate()
  createdAt: Date;

  @IsOptional()
  user?: UserRatingDto;
}

export class StarDistributionDto {
  @IsNumber()
  1: number;

  @IsNumber()
  2: number;

  @IsNumber()
  3: number;

  @IsNumber()
  4: number;

  @IsNumber()
  5: number;
}

export class RatingStatsResponseDto {
  @IsNumber()
  averageRating: number;

  @IsNumber()
  totalComments: number;

  @IsNumber()
  totalStars: number;

  @IsOptional()
  starDistribution?: StarDistributionDto;

  @IsArray()
  recentComments: CommentRatingDto[];
}

export class RatingDataDto {
  @IsNumber()
  averageRating: number;

  @IsNumber()
  totalComments: number;

  @IsNumber()
  totalStars: number;
}
