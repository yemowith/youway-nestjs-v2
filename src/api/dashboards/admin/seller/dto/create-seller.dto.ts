import {
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsOptional,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus, Status, AuthProvider } from '@prisma/client';

class CreateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  // Add other user fields as needed
}

class CreateSellerProfileDto {
  @IsOptional()
  jobTitle?: string;
  @IsOptional()
  about?: string;
  @IsOptional()
  educationInfo?: string;
  @IsOptional()
  experienceInfo?: string;
  @IsOptional()
  certificateInfo?: string;
  @IsOptional()
  website?: string;
  @IsOptional()
  videoUrl?: string;
  @IsOptional()
  countryCode?: string;
  @IsOptional()
  address?: string;
  @IsEnum(Status)
  @IsOptional()
  status?: Status;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  therapies?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  therapySchools?: string[];
}

class CreateIdentityDto {
  @IsEnum(AuthProvider)
  provider: AuthProvider;
  @IsNotEmpty()
  providerId: string;
}

class CreateUserDocumentDto {
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  url: string;
}

class CreateUserLocationDto {
  @IsNotEmpty()
  countryId: string;
}

export class CreateSellerDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @ValidateNested()
  @Type(() => CreateSellerProfileDto)
  sellerProfile: CreateSellerProfileDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIdentityDto)
  @IsOptional()
  identities?: CreateIdentityDto[];

  @ValidateNested()
  @Type(() => CreateUserLocationDto)
  @IsOptional()
  userLocation: CreateUserLocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDocumentDto)
  @IsOptional()
  userDocuments?: CreateUserDocumentDto[];
}
