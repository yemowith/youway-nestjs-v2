import {
  IsString,
  IsNumber,
  IsDate,
  IsArray,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { SellerPackageDto } from 'src/modules/seller/packages/dto';

export class UserIdentityDto {
  @IsString()
  provider: string;

  @IsString()
  providerId: string;
}

export class UserDto {
  @IsString()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsArray()
  identities: UserIdentityDto[];
}

export class TherapyDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class TherapySchoolDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class SellerTherapyDto {
  @IsString()
  id: string;

  therapy: TherapyDto;
}

export class SellerTherapySchoolDto {
  @IsString()
  id: string;

  therapySchool: TherapySchoolDto;
}

export class CommentDto {
  @IsString()
  id: string;

  @IsString()
  content: string;

  @IsNumber()
  stars: number;

  @IsDate()
  createdAt: Date;

  user: UserDto;
}

export class SellerProfileDto {
  @IsString()
  id: string;

  @IsString()
  userId: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @IsString()
  educationInfo?: string;

  @IsOptional()
  @IsString()
  experienceInfo?: string;

  @IsOptional()
  @IsString()
  certificateInfo?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsString()
  status: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  user: UserDto;
  therapies: SellerTherapyDto[];
  therapySchools: SellerTherapySchoolDto[];
  comments: CommentDto[];

  packages: SellerPackageDto[];

  // Rating data
  @IsNumber()
  averageRating: number;

  @IsNumber()
  totalComments: number;

  @IsNumber()
  totalStars: number;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class PaginationDto {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsNumber()
  total: number;

  @IsNumber()
  totalPages: number;

  @IsBoolean()
  hasNext: boolean;

  @IsBoolean()
  hasPrev: boolean;
}

export class SellerListResponseDto {
  @IsArray()
  data: SellerProfileDto[];

  pagination: PaginationDto;
}
