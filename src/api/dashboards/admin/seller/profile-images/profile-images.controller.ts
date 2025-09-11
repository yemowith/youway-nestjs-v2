import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import {
  ProfileImageResponseDto,
  ProfileImageUrlResponseDto,
  DeleteProfileImageResponseDto,
  DeleteAllProfileImagesResponseDto,
  UploadProfileImageResponseDto,
  UploadAllProfileImagesResponseDto,
  ErrorResponseDto,
} from 'src/modules/seller/profile-images/dto/profile-images.dto';
import { ProfileImagesService } from './profile-images.service';

@ApiTags('Admin - Seller Profile Images')
@Controller('admin/seller/profile-images')
export class ProfileImagesController {
  constructor(private readonly profileImagesService: ProfileImagesService) {}

  @Post('upload/:sellerProfileId/:type')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a single profile image' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'sellerProfileId', description: 'Seller Profile ID' })
  @ApiParam({ name: 'type', enum: ['original', 'thumbnail', 'cover'] })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: UploadProfileImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
    type: ErrorResponseDto,
  })
  async uploadProfileImage(
    @Param('sellerProfileId', ParseUUIDPipe) sellerProfileId: string,
    @Param('type') type: 'original' | 'thumbnail' | 'cover',
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.profileImagesService.uploadProfileImage({
      sellerProfileId,
      file,
      type,
    });

    return {
      success: true,
      data: {
        url,
        type,
        sellerProfileId,
      },
    };
  }

  @Post('upload-multiple/:sellerProfileId')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Upload multiple profile images at once' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'sellerProfileId', description: 'Seller Profile ID' })
  @ApiResponse({
    status: 201,
    description: 'Images uploaded successfully',
    type: UploadAllProfileImagesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
    type: ErrorResponseDto,
  })
  async uploadMultipleProfileImages(
    @Param('sellerProfileId', ParseUUIDPipe) sellerProfileId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    // Map files to their types based on fieldname or order
    const fileMap: {
      original?: Express.Multer.File;
      thumbnail?: Express.Multer.File;
      cover?: Express.Multer.File;
    } = {};

    files.forEach((file, index) => {
      const fieldName = file.fieldname.toLowerCase();
      if (fieldName.includes('original')) {
        fileMap.original = file;
      } else if (fieldName.includes('thumbnail')) {
        fileMap.thumbnail = file;
      } else if (fieldName.includes('cover')) {
        fileMap.cover = file;
      } else {
        // Fallback to order: first = original, second = thumbnail, third = cover
        if (index === 0) fileMap.original = file;
        else if (index === 1) fileMap.thumbnail = file;
        else if (index === 2) fileMap.cover = file;
      }
    });

    const result = await this.profileImagesService.uploadAllProfileImages(
      sellerProfileId,
      fileMap,
    );

    return {
      success: true,
      data: {
        ...result,
        sellerProfileId,
      },
    };
  }

  @Get(':sellerProfileId')
  @ApiOperation({ summary: 'Get all profile images for a seller' })
  @ApiParam({ name: 'sellerProfileId', description: 'Seller Profile ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile images retrieved successfully',
    type: ProfileImageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Seller profile not found',
    type: ErrorResponseDto,
  })
  async getProfileImages(
    @Param('sellerProfileId', ParseUUIDPipe) sellerProfileId: string,
  ) {
    const images = await this.profileImagesService.getProfileImages(
      sellerProfileId,
    );

    return {
      success: true,
      data: {
        ...images,
        sellerProfileId,
      },
    };
  }

  @Get(':sellerProfileId/:type')
  @ApiOperation({ summary: 'Get specific profile image URL' })
  @ApiParam({ name: 'sellerProfileId', description: 'Seller Profile ID' })
  @ApiParam({ name: 'type', enum: ['original', 'thumbnail', 'cover'] })
  @ApiResponse({
    status: 200,
    description: 'Image URL retrieved successfully',
    type: ProfileImageUrlResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
    type: ErrorResponseDto,
  })
  async getProfileImageUrl(
    @Param('sellerProfileId', ParseUUIDPipe) sellerProfileId: string,
    @Param('type') type: 'original' | 'thumbnail' | 'cover',
  ) {
    const url = await this.profileImagesService.getProfileImageUrl(
      sellerProfileId,
      type,
    );

    return {
      success: true,
      data: {
        url,
        type,
        sellerProfileId,
      },
    };
  }

  @Delete(':sellerProfileId/:type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a specific profile image' })
  @ApiParam({ name: 'sellerProfileId', description: 'Seller Profile ID' })
  @ApiParam({ name: 'type', enum: ['original', 'thumbnail', 'cover'] })
  @ApiResponse({
    status: 200,
    description: 'Image deleted successfully',
    type: DeleteProfileImageResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Image not found',
    type: ErrorResponseDto,
  })
  async deleteProfileImage(
    @Param('sellerProfileId', ParseUUIDPipe) sellerProfileId: string,
    @Param('type') type: 'original' | 'thumbnail' | 'cover',
  ) {
    const result = await this.profileImagesService.deleteProfileImage(
      sellerProfileId,
      type,
    );

    if (!result.success) {
      throw new NotFoundException(result.message);
    }

    return {
      success: true,
      message: result.message,
      data: {
        type,
        sellerProfileId,
      },
    };
  }

  @Delete(':sellerProfileId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all profile images for a seller' })
  @ApiParam({ name: 'sellerProfileId', description: 'Seller Profile ID' })
  @ApiResponse({
    status: 200,
    description: 'All images deleted successfully',
    type: DeleteAllProfileImagesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile images not found',
    type: ErrorResponseDto,
  })
  async deleteAllProfileImages(
    @Param('sellerProfileId', ParseUUIDPipe) sellerProfileId: string,
  ) {
    const result = await this.profileImagesService.deleteAllProfileImages(
      sellerProfileId,
    );

    if (!result.success) {
      throw new NotFoundException(result.message);
    }

    return {
      success: true,
      message: result.message,
      data: {
        deletedCount: result.deletedCount,
        sellerProfileId,
      },
    };
  }
}
