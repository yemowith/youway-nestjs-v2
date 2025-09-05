import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { CountryInput, CountryResponse } from './countries.controller';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: CountryResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { code: { contains: search } },
            { currencyCode: { contains: search } },
            { timezone: { contains: search } },
          ],
        }
      : undefined;

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'name',
        'code',
        'currencyCode',
        'timezone',
        'createdAt',
        'updatedAt',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.country.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
      }),
      this.prisma.country.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string): Promise<CountryResponse> {
    const country = await this.prisma.country.findUnique({ where: { id } });
    if (!country) throw new NotFoundException('Country not found');
    return country;
  }

  async findDefault(): Promise<CountryResponse> {
    const country = await this.prisma.country.findFirst({
      where: { isDefault: true },
    });
    if (!country) throw new NotFoundException('Default country not found');
    return country;
  }

  async resetDefault(exceptId: string): Promise<any> {
    return this.prisma.country.updateMany({
      where: { id: { not: exceptId } },
      data: { isDefault: false },
    });
  }

  async create(data: CountryInput): Promise<CountryResponse> {
    const { name, code, currencyCode, timezone, isDefault } = data;
    const country = await this.prisma.country.create({
      data: {
        name,
        code,
        currencyCode,
        timezone,
        isDefault,
      },
    });

    if (isDefault) {
      await this.resetDefault(country.id);
    }

    return country;
  }

  async update(id: string, data: CountryInput): Promise<CountryResponse> {
    const existing = await this.prisma.country.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Country not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.currencyCode !== undefined)
      updateData.currencyCode = data.currencyCode;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    const country = await this.prisma.country.update({
      where: { id },
      data: updateData,
    });

    if (data.isDefault) {
      await this.resetDefault(id);
    }

    return country;
  }

  async delete(id: string): Promise<CountryResponse> {
    return this.prisma.country.delete({ where: { id } });
  }

  async searchByText(q: string): Promise<CountryResponse[]> {
    return this.prisma.country.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { code: { contains: q, mode: 'insensitive' } },
          { currencyCode: { contains: q, mode: 'insensitive' } },
          { timezone: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }
}
