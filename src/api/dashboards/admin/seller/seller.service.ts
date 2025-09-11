import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { Prisma, UserStatus, Status, AuthProvider, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SELLER_EVENTS, USER_EVENTS } from 'src/events/user/user.events';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';
import { ReferralService } from 'src/modules/user/referral/referral.service';
import slugify from 'slugify';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly avatarService: AvatarsService,
    private readonly referralService: ReferralService,
    private readonly userService: UserService,
  ) {}

  async findAll(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      pageSize = 20,
      search,
      sortBy,
      sortOrder = 'desc',
    } = params;
    const skip = (page - 1) * pageSize;
    const where: Prisma.UserWhereInput = {
      type: 'SELLER',
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              {
                sellerProfile: {
                  about: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
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
    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          sellerProfile: {
            include: {
              therapies: {
                include: {
                  therapy: true,
                },
              },
              therapySchools: {
                include: {
                  therapySchool: true,
                },
              },
            },
          },
          identities: true,
          userLocation: {
            include: {
              country: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    const newData = await Promise.all(
      data.map(async (item) => {
        return {
          ...item,
          profileImage: await this.avatarService.getProfileAvatar(item),
        };
      }),
    );

    return {
      rows: newData,
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        sellerProfile: {
          include: {
            therapies: {
              include: {
                therapy: true,
              },
            },
            therapySchools: {
              include: {
                therapySchool: true,
              },
            },
          },
        },
        identities: true,
        userLocation: {
          include: {
            country: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Seller not found');
    return user;
  }

  async _afterCreate(userId: string, dto: CreateSellerDto) {
    await this.userService.onRegister(userId, {
      country: dto.userLocation,
    });
  }

  async create(dto: CreateSellerDto) {
    // Check identities
    if (!dto.identities || dto.identities.length === 0) {
      throw new BadRequestException('At least one identity is required');
    }
    // Check for existing identities
    for (const identity of dto.identities) {
      const existing = await this.prisma.identity.findUnique({
        where: {
          provider_providerId: {
            provider: identity.provider,
            providerId: identity.providerId,
          },
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Identity with provider ${identity.provider} and providerId ${identity.providerId} already exists`,
        );
      }
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(dto.user.password, 10);
    const user: User = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...dto.user,
          password: hashedPassword,
          type: 'SELLER',
          sellerProfile: {
            create: {
              ...dto.sellerProfile,
              status: Status.confirmed,
              slug: slugify(`${dto.user.firstName} ${dto.user.lastName}`, {
                lower: true,
              }),
              therapies:
                dto.sellerProfile.therapies &&
                dto.sellerProfile.therapies.length > 0
                  ? {
                      create: dto.sellerProfile.therapies.map((therapyId) => ({
                        therapyId,
                      })),
                    }
                  : undefined,
              therapySchools:
                dto.sellerProfile.therapySchools &&
                dto.sellerProfile.therapySchools.length > 0
                  ? {
                      create: dto.sellerProfile.therapySchools.map(
                        (therapySchoolId) => ({ therapySchoolId }),
                      ),
                    }
                  : undefined,
            },
          },
          identities: { createMany: { data: dto.identities! } },
          userLocation: {
            create: {
              countryId: dto.userLocation.countryId,
            },
          },
        },
        include: {
          sellerProfile: {
            include: {
              therapies: true,
              therapySchools: true,
            },
          },
          identities: true,
        },
      });

      // Emit seller.created event
      this.eventEmitter.emit(SELLER_EVENTS.CREATED, {
        userId: user.id,
        identities: user.identities.map((i) => ({
          provider: i.provider,
          providerId: i.providerId,
        })),
        firstName: user.firstName,
        lastName: user.lastName,
        password: dto.user.password,
        timestamp: new Date(),
      });
      return user;
    });
    await this._afterCreate(user.id, dto);
    return user;
  }

  async update(id: string, dto: UpdateSellerDto) {
    const user = await this.prisma.$transaction(
      async (tx) => {
        // Update user
        const user = await tx.user.update({
          where: { id },
          data: {
            ...dto.user,
          },
        });

        // Update sellerProfile
        if (dto.sellerProfile) {
          // Extract therapies and therapySchools from sellerProfile
          const {
            therapies,
            therapySchools,
            ...sellerProfileData
          } = dto.sellerProfile;

          await tx.sellerProfile.update({
            where: { userId: id },
            data: {
              ...sellerProfileData,
              status: Status.confirmed,
              slug: slugify(`${dto.user.firstName} ${dto.user.lastName}`, {
                lower: true,
              }),
            } as Prisma.SellerProfileUpdateInput,
          });

          // Handle therapies and therapySchools
          const sellerProfile = await tx.sellerProfile.findUnique({
            where: { userId: id },
          });
          if (sellerProfile) {
            if (therapies !== undefined) {
              await tx.sellerProfileTherapy.deleteMany({
                where: { sellerProfileId: sellerProfile.id },
              });
              if (therapies.length > 0) {
                await tx.sellerProfileTherapy.createMany({
                  data: therapies.map((therapyId) => ({
                    sellerProfileId: sellerProfile.id,
                    therapyId,
                  })),
                });
              }
            }
            if (therapySchools !== undefined) {
              await tx.sellerProfileTherapySchool.deleteMany({
                where: { sellerProfileId: sellerProfile.id },
              });
              if (therapySchools.length > 0) {
                await tx.sellerProfileTherapySchool.createMany({
                  data: therapySchools.map((therapySchoolId) => ({
                    sellerProfileId: sellerProfile.id,
                    therapySchoolId,
                  })),
                });
              }
            }
          }
        }

        // Replace identities
        if (dto.identities) {
          await tx.identity.deleteMany({ where: { userId: id } });
          if (dto.identities.length > 0) {
            await tx.identity.createMany({
              data: dto.identities.map((i) => ({ ...i, userId: id })),
            });
          }
        }

        // Return updated user without the expensive include
        return user;
      },
      {
        timeout: 10000, // Increase timeout to 10 seconds
      },
    );

    // Handle user location update outside of transaction
    if (dto.userLocation) {
      await this.userService.onUpdate(id, {
        country: dto.userLocation,
      });
    }

    // Return the updated user with full details
    return this.findOne(id);
  }

  async delete(id: string) {
    return this.prisma.$transaction(async (tx) => {
      // Delete related entities first (if not cascaded)
      await tx.identity.deleteMany({ where: { userId: id } });
      await tx.sellerProfile.deleteMany({ where: { userId: id } });
      await tx.userLocation.deleteMany({ where: { userId: id } });
      // Delete user
      return tx.user.delete({ where: { id } });
    });
  }

  async changePassword(id: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { identities: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
    // Emit password set event
    this.eventEmitter.emit(USER_EVENTS.PASSWORD_SET, {
      userId: user.id,
      identities: user.identities.map((i) => ({
        provider: i.provider,
        providerId: i.providerId,
      })),
      firstName: user.firstName,
      lastName: user.lastName,
      password: newPassword,
      timestamp: new Date(),
    });
    return { message: 'Password updated successfully' };
  }
}
