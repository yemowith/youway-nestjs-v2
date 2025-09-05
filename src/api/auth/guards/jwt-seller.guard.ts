import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Status } from '@prisma/client';

@Injectable()
export class JwtSellerGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    try {
      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('No token provided');
      }

      // Verify and decode the JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('jwt.secret'),
      });

      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      // Find user in database
      const user = await this.prisma.sellerProfile.findUnique({
        where: { userId: payload.sub },
        select: {
          id: true,
          status: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.status !== Status.confirmed) {
        throw new UnauthorizedException('User account is not active');
      }

      // Attach user to request for later use
      request.user = user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid authentication');
    }
  }
}
