import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PackageInput,
  PackageResponse,
  PackagePriceInput,
  PackagePriceResponse,
} from './packages.controller';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: PackageResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [{ name: { contains: search, mode: 'insensitive' as any } }],
        }
      : undefined;

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'name',
        'commission',
        'durationMin',
        'sortOrder',
        'createdAt',
        'updatedAt',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.package.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        include: {
          prices: true,
        },
      }),
      this.prisma.package.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string): Promise<PackageResponse> {
    const package_ = await this.prisma.package.findUnique({
      where: { id },
      include: {
        prices: true,
      },
    });
    if (!package_) throw new NotFoundException('Package not found');
    return package_;
  }

  async create(data: PackageInput): Promise<PackageResponse> {
    return this.prisma.package.create({
      data: {
        name: data.name,
        durationMin: data.durationMin,
        commission: data.commission,
        image: data.image,
        icon: data.icon,
        color: data.color,
        isFree: data.isFree ?? false,
        recommended: data.recommended ?? false,
        sortOrder: data.sortOrder ?? 0,
        canBeReplayed: data.canBeReplayed ?? false,
        isActive: data.isActive ?? true,
        prices: data.prices
          ? {
              create: data.prices.map((price) => ({
                priceMin: price.priceMin,
                priceMax: price.priceMax,
                isFree: price.isFree ?? false,
                currencyCode: price.currencyCode,
              })),
            }
          : undefined,
      },
      include: {
        prices: true,
      },
    });
  }

  async update(id: string, data: PackageInput): Promise<PackageResponse> {
    const existing = await this.prisma.package.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Package not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.durationMin !== undefined)
      updateData.durationMin = data.durationMin;
    if (data.commission !== undefined) updateData.commission = data.commission;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isFree !== undefined) updateData.isFree = data.isFree;
    if (data.recommended !== undefined)
      updateData.recommended = data.recommended;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.canBeReplayed !== undefined)
      updateData.canBeReplayed = data.canBeReplayed;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Handle prices update
    if (data.prices !== undefined) {
      // Delete existing prices and create new ones
      updateData.prices = {
        deleteMany: {},
        create: data.prices.map((price) => ({
          priceMin: price.priceMin,
          priceMax: price.priceMax,
          isFree: price.isFree ?? false,
          currencyCode: price.currencyCode,
        })),
      };
    }

    return this.prisma.package.update({
      where: { id },
      data: updateData,
      include: {
        prices: true,
      },
    });
  }

  async delete(id: string): Promise<PackageResponse> {
    return this.prisma.package.delete({ where: { id } });
  }

  async searchByText(q: string): Promise<PackageResponse[]> {
    return this.prisma.package.findMany({
      where: {
        OR: [{ name: { contains: q, mode: 'insensitive' as any } }],
      },
      orderBy: { name: 'asc' },
      include: {
        prices: true,
      },
    });
  }

  // Package Price Management Methods
  async addPackagePrice(
    packageId: string,
    priceData: PackagePriceInput,
  ): Promise<PackagePriceResponse> {
    const existing = await this.prisma.package.findUnique({
      where: { id: packageId },
    });
    if (!existing) throw new NotFoundException('Package not found');

    return this.prisma.packagePrice.create({
      data: {
        packageId,
        priceMin: priceData.priceMin,
        priceMax: priceData.priceMax,
        isFree: priceData.isFree ?? false,
        currencyCode: priceData.currencyCode,
      },
    });
  }

  async updatePackagePrice(
    priceId: string,
    priceData: PackagePriceInput,
  ): Promise<PackagePriceResponse> {
    const existing = await this.prisma.packagePrice.findUnique({
      where: { id: priceId },
    });
    if (!existing) throw new NotFoundException('Package price not found');

    return this.prisma.packagePrice.update({
      where: { id: priceId },
      data: {
        priceMin: priceData.priceMin,
        priceMax: priceData.priceMax,
        isFree: priceData.isFree ?? false,
        currencyCode: priceData.currencyCode,
      },
    });
  }

  async deletePackagePrice(priceId: string): Promise<PackagePriceResponse> {
    const existing = await this.prisma.packagePrice.findUnique({
      where: { id: priceId },
    });
    if (!existing) throw new NotFoundException('Package price not found');

    return this.prisma.packagePrice.delete({ where: { id: priceId } });
  }

  async getPackagePrices(packageId: string): Promise<PackagePriceResponse[]> {
    const existing = await this.prisma.package.findUnique({
      where: { id: packageId },
    });
    if (!existing) throw new NotFoundException('Package not found');

    return this.prisma.packagePrice.findMany({
      where: { packageId },
      orderBy: { currencyCode: 'asc' },
    });
  }
}
