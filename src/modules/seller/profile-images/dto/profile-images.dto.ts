import { ApiProperty } from '@nestjs/swagger';

export class ProfileImageDto {
  @ApiProperty({
    description: 'Original image URL',
    example: 'https://example.com/images/original.jpg',
    nullable: true,
  })
  originalUrl: string | null;

  @ApiProperty({
    description: 'Thumbnail image URL',
    example: 'https://example.com/images/thumbnail.jpg',
    nullable: true,
  })
  thumbnailUrl: string | null;

  @ApiProperty({
    description: 'Cover image URL',
    example: 'https://example.com/images/cover.jpg',
    nullable: true,
  })
  coverUrl: string | null;
}

export class ProfileImageResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Profile images retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Profile image data',
    type: ProfileImageDto,
  })
  data: ProfileImageDto;
}

export class ProfileImageUrlDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/images/original.jpg',
    nullable: true,
  })
  url: string | null;

  @ApiProperty({
    description: 'Image type',
    example: 'original',
    enum: ['original', 'thumbnail', 'cover'],
  })
  type: 'original' | 'thumbnail' | 'cover';

  @ApiProperty({
    description: 'Seller Profile ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sellerProfileId: string;
}

export class ProfileImageUrlResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Profile image URL retrieved successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Profile image URL data',
    type: ProfileImageUrlDto,
  })
  data: ProfileImageUrlDto;
}

export class DeleteProfileImageResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'original image deleted successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Deleted image data',
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['original', 'thumbnail', 'cover'],
        example: 'original',
      },
      sellerProfileId: {
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  data: {
    type: 'original' | 'thumbnail' | 'cover';
    sellerProfileId: string;
  };
}

export class DeleteAllProfileImagesResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Successfully deleted 3 profile images',
  })
  message: string;

  @ApiProperty({
    description: 'Deleted images data',
    type: 'object',
    properties: {
      deletedCount: {
        type: 'number',
        example: 3,
        description: 'Number of images deleted',
      },
      sellerProfileId: {
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000',
      },
    },
  })
  data: {
    deletedCount: number;
    sellerProfileId: string;
  };
}

export class UploadProfileImageResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Image uploaded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Uploaded image URL',
    example: 'https://example.com/images/original.jpg',
  })
  data: string;
}

export class UploadAllProfileImagesResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'All images uploaded successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Uploaded images data',
    type: 'object',
    properties: {
      originalUrl: {
        type: 'string',
        example: 'https://example.com/images/original.jpg',
        nullable: true,
      },
      thumbnailUrl: {
        type: 'string',
        example: 'https://example.com/images/thumbnail.jpg',
        nullable: true,
      },
      coverUrl: {
        type: 'string',
        example: 'https://example.com/images/cover.jpg',
        nullable: true,
      },
    },
  })
  data: {
    originalUrl?: string;
    thumbnailUrl?: string;
    coverUrl?: string;
  };
}

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: false,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message',
    example: 'Profile image not found',
  })
  message: string;

  @ApiProperty({
    description: 'Error details',
    example: 'The requested profile image does not exist',
    required: false,
  })
  error?: string;
}
