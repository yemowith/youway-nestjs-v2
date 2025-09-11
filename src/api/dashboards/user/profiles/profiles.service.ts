import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import {
  ProfileResponseDto,
  ProfileRolle,
  UserOptionDto,
} from './dto/profile.dto';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';
import { ReferralService } from 'src/modules/user/referral/referral.service';
import { UpdateUserOptionDto } from './dto/update-user-option.dto';
import {
  CountryDto,
  UserLocationDto,
} from 'src/modules/user/location/dto/location.dto';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referral: ReferralService,
    private readonly avatarsService: AvatarsService,
  ) {}

  async getProfileById(userId: string): Promise<ProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        UserOption: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      type: user.type,
      fullName: `${user.firstName} ${user.lastName}`,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: await this.getProfileAvatar(user),
      about: user.about || undefined,
      birthDate: user.birthDate || undefined,
      role: await this.getProfileRole(userId),
      options: user.UserOption,
      location: await this.getUserLocation(userId),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async getDefaultCountry(): Promise<CountryDto> {
    const country = await this.prisma.country.findFirst({
      where: { isDefault: true },
      include: { currency: true },
    });
    if (!country) {
      throw new Error('Default country not found');
    }
    return country as CountryDto;
  }

  async getUserLocation(userId: string): Promise<UserLocationDto> {
    const userLocation = await this.prisma.userLocation.findUnique({
      where: { userId },
      include: {
        country: {
          include: {
            currency: true,
          },
        },
      },
    });
    if (!userLocation) {
      const defaultCountry = await this.getDefaultCountry();
      return {
        id: '',
        userId: userId,
        countryId: defaultCountry.id,
        country: defaultCountry,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return userLocation as UserLocationDto;
  }

  async getProfileRole(userId: string): Promise<ProfileRolle> {
    const isSeller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId,
      },
    });
    return isSeller ? ProfileRolle.SELLER : ProfileRolle.USER;
  }

  async getProfileAvatar(user: any): Promise<string> {
    return await this.avatarsService.getProfileAvatar(user);
  }

  async getUserReferral(userId: string) {
    const referral = await this.referral.getUserReferral(userId);

    return referral;
  }

  async updateUserOption(
    userId: string,
    updateUserOptionDto: UpdateUserOptionDto,
  ): Promise<{ success: boolean; message: string; data: UserOptionDto[] }> {
    const { optionKey, optionValue } = updateUserOptionDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update or create the user option
    const updatedOption = await this.prisma.userOption.upsert({
      where: {
        userId_optionKey: {
          userId,
          optionKey,
        },
      },
      update: {
        optionVal: optionValue,
      },
      create: {
        userId,
        optionKey,
        optionVal: optionValue,
      },
    });

    if (!updatedOption) {
      throw new BadRequestException('Failed to update user option');
    }

    // Get all user options after update
    const userOptions = await this.prisma.userOption.findMany({
      where: { userId },
      select: {
        userId: true,
        optionKey: true,
        optionVal: true,
      },
    });

    return {
      success: true,
      message: 'User option updated successfully',
      data: userOptions as UserOptionDto[],
    };
  }
}
