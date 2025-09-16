import {
  IsNotEmpty,
  ValidateNested,
  IsArray,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserStatus, AuthProvider, Sex } from '@prisma/client';
import { CreateSellerProfileDto } from './create-seller-profile.dto';

class UpdateUserDto {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;

  @IsEnum(UserStatus)
  status: UserStatus;

  // Add other user fields as needed

  @IsOptional()
  birthYear?: number;

  @IsOptional()
  sex?: Sex;
}

class UpdateIdentityDto {
  @IsEnum(AuthProvider)
  provider: AuthProvider;
  @IsNotEmpty()
  providerId: string;
}

class UpdateUserDocumentDto {
  @IsNotEmpty()
  type: string;
  @IsNotEmpty()
  url: string;
}

class UpdateUserLocationDto {
  @IsNotEmpty()
  countryId: string;
}

export class UpdateSellerDto {
  @ValidateNested()
  @Type(() => UpdateUserDto)
  user: UpdateUserDto;

  @ValidateNested()
  @Type(() => CreateSellerProfileDto)
  sellerProfile: CreateSellerProfileDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateIdentityDto)
  @IsOptional()
  identities?: UpdateIdentityDto[];

  @ValidateNested()
  @Type(() => UpdateUserLocationDto)
  @IsOptional()
  userLocation: UpdateUserLocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateUserDocumentDto)
  @IsOptional()
  userDocuments?: UpdateUserDocumentDto[];
}
