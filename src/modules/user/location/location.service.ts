import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { CountryDto, UserLocationDto } from './dto/location.dto';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

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

  async getLocation(userId: string): Promise<UserLocationDto> {
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

  async createLocation(
    userId: string,
    country: {
      countryCode?: string;
      countryId?: string;
    },
  ) {
    const { countryCode, countryId } = country;

    const where = countryCode ? { code: countryCode } : { id: countryId };

    let countryRow = await this.prisma.country.findUnique({
      where: where,
    });

    if (!countryRow) {
      countryRow = await this.prisma.country.findFirst({
        where: {
          isDefault: true,
        },
      });
    }

    if (!countryRow) {
      throw new Error('Country not found');
    }

    const data = {
      userId,
      countryId: countryRow.id,
    };

    return this.prisma.userLocation.upsert({
      where: { userId },
      update: data,
      create: data,
    });
  }

  async updateLocation(
    userId: string,
    country: {
      countryCode?: string;
      countryId?: string;
    },
  ) {
    const { countryCode, countryId } = country;

    if (!countryCode && !countryId) {
      throw new Error('Country code or country id is required');
    }

    const where = countryCode ? { code: countryCode } : { id: countryId };

    const countryRow = await this.prisma.country.findUnique({
      where: where,
    });

    if (!countryRow) {
      throw new Error('Country not found');
    }

    return this.prisma.userLocation.update({
      where: { userId },
      data: {
        countryId: countryRow.id,
      },
    });
  }
}
