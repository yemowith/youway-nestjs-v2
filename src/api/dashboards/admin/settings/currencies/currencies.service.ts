import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { CurrencyInput, CurrencyResponse } from './currencies.controller';

@Injectable()
export class CurrenciesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: CurrencyResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { code: { contains: search } },
            { name: { contains: search } },
            { symbol: { contains: search } },
            { isoCode: { contains: search } },
            { leftCode: { contains: search } },
            { rightCode: { contains: search } },
          ],
        }
      : undefined;

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'code',
        'name',
        'symbol',
        'isoCode',
        'leftCode',
        'rightCode',
        'createdAt',
        'updatedAt',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.currency.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
      }),
      this.prisma.currency.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize,
      page,
    };
  }

  async findAllCurrencies(): Promise<CurrencyResponse[]> {
    return this.prisma.currency.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(code: string): Promise<CurrencyResponse> {
    const currency = await this.prisma.currency.findUnique({ where: { code } });
    if (!currency) throw new NotFoundException('Currency not found');
    return currency;
  }

  async findDefault(): Promise<CurrencyResponse> {
    const currency = await this.prisma.currency.findFirst({
      where: { isDefault: true },
    });
    if (!currency) throw new NotFoundException('Default currency not found');
    return currency;
  }

  async resetDefault(exceptCode: string): Promise<any> {
    return this.prisma.currency.updateMany({
      where: { code: { not: exceptCode } },
      data: { isDefault: false },
    });
  }

  async create(data: CurrencyInput): Promise<CurrencyResponse> {
    const {
      code,
      name,
      symbol,
      isoCode,
      leftCode,
      rightCode,
      isDefault,
    } = data;
    const currency = await this.prisma.currency.create({
      data: {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        symbol: symbol.trim(),
        isoCode: isoCode.trim().toUpperCase(),
        leftCode: leftCode?.trim().toUpperCase() || null,
        rightCode: rightCode?.trim().toUpperCase() || null,
      },
    });

    if (isDefault) {
      await this.resetDefault(currency.code);
    }

    return currency;
  }

  async update(code: string, data: CurrencyInput): Promise<CurrencyResponse> {
    const existing = await this.prisma.currency.findUnique({ where: { code } });
    if (!existing) throw new NotFoundException('Currency not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.symbol !== undefined) updateData.symbol = data.symbol.trim();
    if (data.isoCode !== undefined)
      updateData.isoCode = data.isoCode.trim().toUpperCase();
    if (data.leftCode !== undefined) {
      updateData.leftCode = data.leftCode?.trim()
        ? data.leftCode.trim().toUpperCase()
        : null;
    }
    if (data.rightCode !== undefined) {
      updateData.rightCode = data.rightCode?.trim()
        ? data.rightCode.trim().toUpperCase()
        : null;
    }
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    const currency = await this.prisma.currency.update({
      where: { code },
      data: updateData,
    });

    if (data.isDefault) {
      await this.resetDefault(code);
    }

    return currency;
  }

  async delete(code: string): Promise<CurrencyResponse> {
    return this.prisma.currency.delete({ where: { code } });
  }

  async searchByText(q: string): Promise<CurrencyResponse[]> {
    return this.prisma.currency.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { symbol: { contains: q, mode: 'insensitive' } },
          { isoCode: { contains: q, mode: 'insensitive' } },
          { leftCode: { contains: q, mode: 'insensitive' } },
          { rightCode: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }
}
