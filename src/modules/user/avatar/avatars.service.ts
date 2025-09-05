import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from 'src/clients/supabase/supabase.service';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

interface AvatarOptions {
  name: string;
  background: string;
  color: string;
  size: number;
}

@Injectable()
export class AvatarsService {
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

  generateAvatar(options: AvatarOptions): string {
    return this.generateSvg(options);
  }

  getProfileAvatar(user: any): string {
    const baseUrl = this.configService.get<string>(
      'app.baseUrl',
      'http://localhost:3000',
    );
    return (
      user.profileImage ||
      `${baseUrl}/profiles/avatars/generate?name=${encodeURIComponent(
        `${user.firstName} ${user.lastName}`,
      )}`
    );
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!file || !file.buffer) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate image dimensions
    const metadata = await sharp(file.buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('Invalid image file');
    }

    // Check minimum dimensions
    if (metadata.width < 100 || metadata.height < 100) {
      throw new BadRequestException(
        'Image dimensions must be at least 100x100 pixels',
      );
    }

    // Resize image to max 500x500 while maintaining aspect ratio
    const processedBuffer = await sharp(file.buffer)
      .resize(500, 500, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality for better compression
      .toBuffer();

    // Upload avatar to Supabase
    const fileName = `${userId}-${Date.now()}.jpg`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await this.supabaseService
      .getClient()
      .storage.from('avatars')
      .upload(filePath, processedBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) {
      throw new BadRequestException(
        'Failed to upload avatar: ' + error.message,
      );
    }

    const {
      data: { publicUrl },
    } = this.supabaseService
      .getClient()
      .storage.from('avatars')
      .getPublicUrl(filePath);

    // Update user's profile image
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        profileImage: publicUrl,
      },
    });

    return publicUrl;
  }
}
