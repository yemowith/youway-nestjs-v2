import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { User, UserType, UserStatus, AuthProvider, Sex } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Custom type for identity responses
type IdentityResponse = {
  id: string;
  provider: AuthProvider;
  providerId: string;
  createdAt: Date;
};

// Custom type for user responses (excluding sensitive data)
type UserResponse = {
  id: string;
  firstName: string;
  lastName: string;
  type: UserType;
  status: UserStatus;
  profileImage: string | null;
  about: string | null;
  birthYear?: number | null;
  sex?: Sex | null;
  createdAt: Date;
  updatedAt: Date;
  identities: IdentityResponse[];
};

// Custom type for user input (excluding sensitive and auto-generated fields)
type UserInput = {
  firstName?: string;
  lastName?: string;
  type?: UserType;
  status?: UserStatus;
  profileImage?: string | null;
  about?: string | null;
  birthDate?: Date | null;
};

// Custom type for password change input
type PasswordChangeInput = {
  newPassword: string;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: UserResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
          ],
        }
      : undefined;

    // Build orderBy object based on sortBy parameter
    let orderBy: any = { createdAt: 'desc' }; // default sorting

    if (sortBy) {
      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = [
        'firstName',
        'lastName',
        'status',
        'createdAt',
        'updatedAt',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          type: true,
          status: true,
          profileImage: true,
          about: true,
          birthYear: true,
          sex: true,
          createdAt: true,
          updatedAt: true,
          identities: {
            select: {
              id: true,
              provider: true,
              providerId: true,
              createdAt: true,
            },
          },
          // Exclude sensitive fields like password
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      rows: data as UserResponse[],
      total: total,
      page: page,
      pageSize: pageSize,
    };
  }

  async findOne(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        type: true,
        status: true,
        profileImage: true,
        about: true,

        createdAt: true,
        updatedAt: true,
        identities: {
          select: {
            id: true,
            provider: true,
            providerId: true,
            createdAt: true,
          },
        },
        // Exclude sensitive fields like password
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user as UserResponse;
  }

  async update(id: string, data: UserInput): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: data as any,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        type: true,
        status: true,
        profileImage: true,
        about: true,
        birthYear: true,
        sex: true,
        createdAt: true,
        updatedAt: true,
        identities: {
          select: {
            id: true,
            provider: true,
            providerId: true,
            createdAt: true,
          },
        },
      },
    }) as Promise<UserResponse>;
  }

  async delete(id: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        type: true,
        status: true,
        profileImage: true,
        birthYear: true,
        sex: true,
        about: true,

        createdAt: true,
        updatedAt: true,
        identities: {
          select: {
            id: true,
            provider: true,
            providerId: true,
            createdAt: true,
          },
        },
      },
    }) as Promise<UserResponse>;
  }

  async updateStatus(id: string, status: UserStatus): Promise<UserResponse> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        type: true,
        status: true,
        profileImage: true,
        about: true,
        birthYear: true,
        sex: true,
        createdAt: true,
        updatedAt: true,
        identities: {
          select: {
            id: true,
            provider: true,
            providerId: true,
            createdAt: true,
          },
        },
      },
    }) as Promise<UserResponse>;
  }

  async changePassword(
    id: string,
    data: PasswordChangeInput,
  ): Promise<{ message: string }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) throw new NotFoundException('User not found');

    // Validate password
    if (!data.newPassword || data.newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds);

    // Update the user's password
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }
}
