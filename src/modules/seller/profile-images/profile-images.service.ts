import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from 'src/clients/supabase/supabase.service';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

interface ProfileImageOptions {
  sellerProfileId: string;
  file: Express.Multer.File;
  type: 'original' | 'thumbnail' | 'cover';
}

interface AvatarOptions {
  name: string;
  background: string;
  color: string;
  size: number;
}

@Injectable()
export class ProfileImagesService {
  private readonly imageConfig = {
    sizes: {
      original: { width: 500, height: 330 },
      thumbnail: { width: 300, height: 300 },
      cover: { width: 800, height: 400 },
    },
    quality: {
      original: 85,
      thumbnail: 80,
      cover: 85,
    },
    minDimensions: {
      width: 200,
      height: 200,
    },
    fallback: {
      original: 400,
      thumbnail: 300,
      cover: 400,
    },
  };

  private readonly colors = [
    '#1abc9c',
    '#2ecc71',
    '#3498db',
    '#9b59b6',
    '#34495e',
    '#16a085',
    '#27ae60',
    '#2980b9',
    '#8e44ad',
    '#2c3e50',
    '#f1c40f',
    '#e67e22',
    '#e74c3c',
    '#95a5a6',
    '#f39c12',
    '#d35400',
    '#c0392b',
    '#bdc3c7',
    '#7f8c8d',
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getRandomColor(): string {
    return this.colors[Math.floor(Math.random() * this.colors.length)];
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private generateSvg(options: AvatarOptions): string {
    const { name, background, color, size } = options;
    const initials = this.getInitials(name);
    const bgColor =
      background === 'random' ? this.getRandomColor() : `#${background}`;
    const textColor = `#${color}`;

    // Calculate font size based on the number of characters
    const fontSize = Math.floor(size * (initials.length === 1 ? 0.5 : 0.4));

    // Center point of the SVG
    const centerX = size / 2;
    const centerY = size / 2;

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${bgColor}" rx="${
      size * 0.1
    }" />
        <text
          x="${centerX}"
          y="${centerY}"
          font-family="Arial, sans-serif"
          font-size="${fontSize}px"
          font-weight="bold"
          fill="${textColor}"
          text-anchor="middle"
          dominant-baseline="central"
          letter-spacing="0.5"
        >
          ${initials}
        </text>
      </svg>
    `.trim();
  }

  private async validateImage(file: Express.Multer.File): Promise<void> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate image dimensions
    const metadata = await sharp(file.buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('Invalid image file');
    }

    // Check minimum dimensions
    if (
      metadata.width < this.imageConfig.minDimensions.width ||
      metadata.height < this.imageConfig.minDimensions.height
    ) {
      throw new BadRequestException(
        `Image dimensions must be at least ${this.imageConfig.minDimensions.width}x${this.imageConfig.minDimensions.height} pixels`,
      );
    }
  }

  private async processImage(
    buffer: Buffer,
    type: 'original' | 'thumbnail' | 'cover',
  ): Promise<Buffer> {
    const baseOptions = {
      fit: 'inside' as const,
      withoutEnlargement: true,
    };

    const size = this.imageConfig.sizes[type];
    const quality = this.imageConfig.quality[type];

    switch (type) {
      case 'original':
        return sharp(buffer)
          .resize(size.width, size.height, baseOptions)
          .jpeg({ quality })
          .toBuffer();

      case 'thumbnail':
        return sharp(buffer)
          .resize(size.width, size.height, baseOptions)
          .jpeg({ quality })
          .toBuffer();

      case 'cover':
        return sharp(buffer)
          .resize(size.width, size.height, { ...baseOptions, fit: 'cover' })
          .jpeg({ quality })
          .toBuffer();

      default:
        throw new BadRequestException('Invalid image type');
    }
  }

  private async uploadToSupabase(
    buffer: Buffer,
    fileName: string,
    bucket: string,
  ): Promise<string> {
    const { data, error } = await this.supabaseService
      .getClient()
      .storage.from(bucket)
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = this.supabaseService
      .getClient()
      .storage.from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async uploadProfileImage(options: ProfileImageOptions): Promise<string> {
    const { sellerProfileId, file, type } = options;

    // Check if seller profile exists
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
    });

    if (!sellerProfile) {
      throw new NotFoundException('Seller profile not found');
    }

    await this.validateImage(file);

    // Process image based on type
    const processedBuffer = await this.processImage(file.buffer, type);

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${sellerProfileId}-${type}-${timestamp}.jpg`;
    const filePath = `seller-profiles/${fileName}`;

    // Upload to Supabase
    const publicUrl = await this.uploadToSupabase(
      processedBuffer,
      filePath,
      'seller-profiles',
    );

    // Update or create profile image record
    await this.prisma.sellerProfileImage.upsert({
      where: { sellerProfileId },
      update: {
        [type === 'original'
          ? 'originalUrl'
          : type === 'thumbnail'
          ? 'thumbnailUrl'
          : 'coverUrl']: publicUrl,
      },
      create: {
        sellerProfileId,
        originalUrl: type === 'original' ? publicUrl : null,
        thumbnailUrl: type === 'thumbnail' ? publicUrl : null,
        coverUrl: type === 'cover' ? publicUrl : null,
      },
    });

    return publicUrl;
  }

  async uploadAllProfileImages(
    sellerProfileId: string,
    files: {
      original?: Express.Multer.File;
      thumbnail?: Express.Multer.File;
      cover?: Express.Multer.File;
    },
  ): Promise<{
    originalUrl?: string;
    thumbnailUrl?: string;
    coverUrl?: string;
  }> {
    // Check if seller profile exists
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
    });

    if (!sellerProfile) {
      throw new NotFoundException('Seller profile not found');
    }

    const results: {
      originalUrl?: string;
      thumbnailUrl?: string;
      coverUrl?: string;
    } = {};

    // Process original image
    if (files.original) {
      await this.validateImage(files.original);
      const processedBuffer = await this.processImage(
        files.original.buffer,
        'original',
      );
      const fileName = `${sellerProfileId}-original-${Date.now()}.jpg`;
      const filePath = `seller-profiles/${fileName}`;
      results.originalUrl = await this.uploadToSupabase(
        processedBuffer,
        filePath,
        'seller-profiles',
      );
    }

    // Process thumbnail image
    if (files.thumbnail) {
      await this.validateImage(files.thumbnail);
      const processedBuffer = await this.processImage(
        files.thumbnail.buffer,
        'thumbnail',
      );
      const fileName = `${sellerProfileId}-thumbnail-${Date.now()}.jpg`;
      const filePath = `seller-profiles/${fileName}`;
      results.thumbnailUrl = await this.uploadToSupabase(
        processedBuffer,
        filePath,
        'seller-profiles',
      );
    }

    // Process cover image
    if (files.cover) {
      await this.validateImage(files.cover);
      const processedBuffer = await this.processImage(
        files.cover.buffer,
        'cover',
      );
      const fileName = `${sellerProfileId}-cover-${Date.now()}.jpg`;
      const filePath = `seller-profiles/${fileName}`;
      results.coverUrl = await this.uploadToSupabase(
        processedBuffer,
        filePath,
        'seller-profiles',
      );
    }

    // Update database with all uploaded images
    await this.prisma.sellerProfileImage.upsert({
      where: { sellerProfileId },
      update: {
        originalUrl: results.originalUrl,
        thumbnailUrl: results.thumbnailUrl,
        coverUrl: results.coverUrl,
      },
      create: {
        sellerProfileId,
        originalUrl: results.originalUrl,
        thumbnailUrl: results.thumbnailUrl,
        coverUrl: results.coverUrl,
      },
    });

    return results;
  }

  async getProfileImages(sellerProfileId: string) {
    const profileImage = await this.prisma.sellerProfileImage.findUnique({
      where: { sellerProfileId },
    });

    if (!profileImage) {
      return {
        originalUrl: null,
        thumbnailUrl: null,
        coverUrl: null,
      };
    }

    return {
      originalUrl: profileImage.originalUrl,
      thumbnailUrl: profileImage.thumbnailUrl,
      coverUrl: profileImage.coverUrl,
    };
  }

  async deleteProfileImage(
    sellerProfileId: string,
    type: 'original' | 'thumbnail' | 'cover',
  ): Promise<{ success: boolean; message: string }> {
    const profileImage = await this.prisma.sellerProfileImage.findUnique({
      where: { sellerProfileId },
    });

    if (!profileImage) {
      return {
        success: false,
        message: 'Profile image not found',
      };
    }

    const fieldToUpdate =
      type === 'original'
        ? 'originalUrl'
        : type === 'thumbnail'
        ? 'thumbnailUrl'
        : 'coverUrl';
    const currentUrl = profileImage[fieldToUpdate];

    if (!currentUrl) {
      return {
        success: false,
        message: `${type} image not found`,
      };
    }

    try {
      // Extract file path from URL for deletion
      const urlParts = currentUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `seller-profiles/${fileName}`;

      // Delete from Supabase storage
      const { error } = await this.supabaseService
        .getClient()
        .storage.from('seller-profiles')
        .remove([filePath]);

      if (error) {
        console.warn(`Failed to delete file from storage: ${error.message}`);
      }

      // Update database
      await this.prisma.sellerProfileImage.update({
        where: { sellerProfileId },
        data: {
          [fieldToUpdate]: null,
        },
      });

      return {
        success: true,
        message: `${type} image deleted successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete ${type} image: ${error.message}`,
      };
    }
  }

  async deleteAllProfileImages(
    sellerProfileId: string,
  ): Promise<{ success: boolean; message: string; deletedCount: number }> {
    const profileImage = await this.prisma.sellerProfileImage.findUnique({
      where: { sellerProfileId },
    });

    if (!profileImage) {
      return {
        success: false,
        message: 'Profile image not found',
        deletedCount: 0,
      };
    }

    try {
      const filesToDelete: string[] = [];
      let deletedCount = 0;

      // Collect all file paths
      if (profileImage.originalUrl) {
        const urlParts = profileImage.originalUrl.split('/');
        filesToDelete.push(`seller-profiles/${urlParts[urlParts.length - 1]}`);
        deletedCount++;
      }

      if (profileImage.thumbnailUrl) {
        const urlParts = profileImage.thumbnailUrl.split('/');
        filesToDelete.push(`seller-profiles/${urlParts[urlParts.length - 1]}`);
        deletedCount++;
      }

      if (profileImage.coverUrl) {
        const urlParts = profileImage.coverUrl.split('/');
        filesToDelete.push(`seller-profiles/${urlParts[urlParts.length - 1]}`);
        deletedCount++;
      }

      // Delete all files from Supabase storage
      if (filesToDelete.length > 0) {
        const { error } = await this.supabaseService
          .getClient()
          .storage.from('seller-profiles')
          .remove(filesToDelete);

        if (error) {
          console.warn(`Failed to delete files from storage: ${error.message}`);
        }
      }

      // Delete the entire record
      await this.prisma.sellerProfileImage.delete({
        where: { sellerProfileId },
      });

      return {
        success: true,
        message: `Successfully deleted ${deletedCount} profile images`,
        deletedCount,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to delete profile images: ${error.message}`,
        deletedCount: 0,
      };
    }
  }

  async getProfileImageUrl(
    sellerProfileId: string,
    type: 'original' | 'thumbnail' | 'cover',
  ): Promise<string | null> {
    const profileImage = await this.prisma.sellerProfileImage.findUnique({
      where: { sellerProfileId },
      select: {
        originalUrl: true,
        thumbnailUrl: true,
        coverUrl: true,
      },
    });

    if (!profileImage) {
      return null;
    }

    return profileImage[
      type === 'original'
        ? 'originalUrl'
        : type === 'thumbnail'
        ? 'thumbnailUrl'
        : 'coverUrl'
    ];
  }

  async getProfileImageWithFallback(
    sellerProfileId: string,
    type: 'original' | 'thumbnail' | 'cover' = 'original',
    options?: {
      size?: number;
      background?: string;
      color?: string;
    },
  ): Promise<string> {
    // First try to get the actual profile image
    const profileImage = await this.prisma.sellerProfileImage.findUnique({
      where: { sellerProfileId },
      include: {
        profile: {
          include: {
            user: true,
          },
        },
      },
    });

    // If profile image exists and has the requested type, return it
    if (profileImage) {
      const imageUrl =
        profileImage[
          type === 'original'
            ? 'originalUrl'
            : type === 'thumbnail'
            ? 'thumbnailUrl'
            : 'coverUrl'
        ];

      if (imageUrl) {
        return imageUrl;
      }
    }

    // If no image exists, get seller profile info for SVG generation
    const sellerProfile = await this.prisma.sellerProfile.findUnique({
      where: { id: sellerProfileId },
      include: {
        user: true,
      },
    });

    if (!sellerProfile) {
      throw new NotFoundException('Seller profile not found');
    }

    // Generate SVG avatar as fallback
    const baseUrl = this.configService.get<string>(
      'app.baseUrl',
      'http://localhost:3000',
    );

    const name = `${sellerProfile.user.firstName} ${sellerProfile.user.lastName}`;
    const size = options?.size || this.imageConfig.fallback[type];
    const background = options?.background || 'random';
    const color = options?.color || 'ffffff';

    const svg = this.generateSvg({
      name,
      background,
      color,
      size,
    });

    // Return a data URL for the SVG
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString(
      'base64',
    )}`;

    return dataUrl;
  }

  async getProfileImagesWithFallback(
    sellerProfileId: string,
    options?: {
      size?: number;
      background?: string;
      color?: string;
    },
  ): Promise<{
    originalUrl: string;
    thumbnailUrl: string;
    coverUrl: string;
  }> {
    const [original, thumbnail, cover] = await Promise.all([
      this.getProfileImageWithFallback(sellerProfileId, 'original', options),
      this.getProfileImageWithFallback(sellerProfileId, 'thumbnail', {
        ...options,
        size: options?.size
          ? Math.floor(options.size * 0.25)
          : this.imageConfig.fallback.thumbnail,
      }),
      this.getProfileImageWithFallback(sellerProfileId, 'cover', {
        ...options,
        size: options?.size
          ? Math.floor(options.size * 0.5)
          : this.imageConfig.fallback.cover,
      }),
    ]);

    return {
      originalUrl: original,
      thumbnailUrl: thumbnail,
      coverUrl: cover,
    };
  }
}
