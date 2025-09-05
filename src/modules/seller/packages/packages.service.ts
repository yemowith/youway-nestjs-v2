import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { PackageDto, SellerPackageDto } from './dto';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async setupSellerPackages(sellerId: string) {
    const packages = await this.prisma.package.findMany({
      where: {
        isActive: true,
      },
      include: {
        prices: true,
      },
    });
    for (const pkg of packages) {
      if (pkg.prices.length === 0) {
        continue;
      }
      await this.prisma.sellerPackage.create({
        data: {
          sellerId: sellerId,
          packageId: pkg.id,
          price: pkg.prices[0].priceMax,
          currencyCode: 'TRY',
        },
      });
    }
  }

  async getSellerPackages(sellerId: string): Promise<SellerPackageDto[]> {
    const packages = await this.prisma.sellerPackage.findMany({
      where: {
        sellerId: sellerId,
      },
      select: {
        package: {
          select: {
            id: true,
            name: true,
            durationMin: true,
            image: true,
            icon: true,
            color: true,
            isFree: true,
            recommended: true,
            sortOrder: true,
            canBeReplayed: true,
            isActive: true,
          },
        },
        price: true,
        sellerId: true,
        packageId: true,
        currency: true,
        currencyCode: true,
      },
    });

    return packages;
  }

  async getPackageById(
    packageId: string,
    sellerId: string,
  ): Promise<SellerPackageDto> {
    const packageData = await this.prisma.sellerPackage.findUnique({
      where: {
        sellerId_packageId: { packageId: packageId, sellerId: sellerId },
      },
      include: {
        package: true,
        currency: true,
      },
    });
    if (!packageData) {
      throw new NotFoundException('Package not found');
    }

    return packageData;
  }
}
