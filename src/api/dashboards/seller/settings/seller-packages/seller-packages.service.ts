import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { SellerPackageDto } from 'src/modules/seller/packages/dto';
import { LocationService } from 'src/modules/user/location/location.service';

@Injectable()
export class SellerPackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
  ) {}

  async getSellerPackages(sellerId: string) {
    const location = await this.locationService.getLocation(sellerId);

    if (!location) {
      throw new BadRequestException('Location not found for seller');
    }

    const packages = await this.prisma.package.findMany({
      where: { isActive: true },
      include: {
        prices: true,
      },
    });

    const sellerPackages: SellerPackageDto[] = [];

    for (const pkg of packages) {
      let sellerPackage = await this.prisma.sellerPackage.findUnique({
        where: { sellerId_packageId: { sellerId, packageId: pkg.id } },
        include: {
          package: {
            include: {
              prices: true,
            },
          },
          currency: true,
        },
      });
      if (!sellerPackage) {
        sellerPackage = await this.prisma.sellerPackage.create({
          data: {
            sellerId,
            packageId: pkg.id,
            price: pkg.prices[0].priceMax,
            currencyCode: location.country?.currencyCode || 'TRY',
          },
          include: {
            package: {
              include: {
                prices: true,
              },
            },
            currency: true,
          },
        });
      }
      sellerPackages.push(sellerPackage);
    }

    return sellerPackages;
  }

  async updateSellerPackages(
    sellerId: string,
    pks: {
      packageId: string;
      price: number;
      isActive: boolean;
    }[],
  ) {
    const location = await this.locationService.getLocation(sellerId);

    if (!location) {
      throw new BadRequestException('Location not found for seller');
    }

    const packages = await this.prisma.package.findMany({
      where: { isActive: true },
      include: {
        prices: true,
      },
    });

    for (const pk of packages) {
      const sellerPackage = pks.find((p) => p.packageId === pk.id);
      if (!sellerPackage) {
        throw new BadRequestException('Form data is not valid');
      }

      if (
        Number(sellerPackage.price) > Number(pk.prices[0].priceMax) ||
        sellerPackage.price < Number(pk.prices[0].priceMin)
      ) {
        throw new BadRequestException('Price is not valid');
      }

      if (sellerPackage.isActive) {
        await this.prisma.sellerPackage.update({
          where: { sellerId_packageId: { sellerId, packageId: pk.id } },
          data: { isActive: pk.isActive, price: sellerPackage.price },
        });
      }
    }
  }
}
