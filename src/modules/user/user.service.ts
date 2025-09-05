import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { ReferralService } from './referral/referral.service';
import { LocationService } from './location/location.service';
import { AvailabilityService } from '../seller/availability/availability.service';
import { AvailabilitySetupService } from '../seller/availability/availability-setup.service';
import { PackagesService } from '../seller/packages/packages.service';
import { UserLocationDto } from './location/dto/location.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referralService: ReferralService,
    private readonly locationService: LocationService,
    private readonly availabilityService: AvailabilitySetupService,
    private readonly packagesService: PackagesService,
  ) {}

  async onRegister(
    id: string,
    details: {
      referralCode?: string;
      country?: {
        countryCode?: string;
        countryId?: string;
      };
    },
  ) {
    const { referralCode, country } = details;

    await this.referralService.generateReferralProfile(id);

    if (referralCode) {
      await this.referralService.saveUserReferral(id, referralCode);
    }

    await this.locationService.createLocation(id, country ?? {});

    if (await this.isSeller(id)) {
      await this.availabilityService.setupSellerAvailability(id);
      await this.packagesService.setupSellerPackages(id);
    }
  }

  async onUpdate(
    id: string,
    details: {
      country?: {
        countryCode?: string;
        countryId?: string;
      };
    },
  ) {
    const { country } = details;

    if (country) {
      await this.locationService.updateLocation(id, country);
    }

    if (await this.isSeller(id)) {
      await this.availabilityService.setupSellerAvailability(id);
    }
  }

  async isSeller(id: string): Promise<boolean> {
    const seller = await this.prisma.sellerProfile.count({
      where: { userId: id },
    });
    return seller > 0;
  }

  async getUseMail(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        identities: true,
      },
    });

    return (
      user?.identities.find((identity) => identity.provider === 'EMAIL')
        ?.providerId ?? null
    );
  }

  async getUserPhone(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        identities: true,
      },
    });

    return (
      user?.identities.find((identity) => identity.provider === 'PHONE')
        ?.providerId ?? null
    );
  }

  async getUserLocation(userId: string): Promise<UserLocationDto> {
    const user = await this.locationService.getLocation(userId);
    return user;
  }
}
