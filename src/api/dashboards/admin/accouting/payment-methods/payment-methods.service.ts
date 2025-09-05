import { Injectable, NotFoundException } from '@nestjs/common';

import {
  PaymentMethodInput,
  PaymentMethodResponse,
} from './payment-methods.controller';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class PaymentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: PaymentMethodResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as any } },
            { providerKey: { contains: search, mode: 'insensitive' as any } },
            { description: { contains: search, mode: 'insensitive' as any } },
          ],
        }
      : undefined;

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'name',
        'providerKey',
        'icon',
        'color',
        'sortOrder',
        'isActive',
        'createdAt',
        'updatedAt',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.paymentMethod.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        include: {
          settings: true,
        },
      }),
      this.prisma.paymentMethod.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string): Promise<PaymentMethodResponse> {
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });
    if (!paymentMethod) throw new NotFoundException('Payment method not found');
    return paymentMethod;
  }

  async create(data: PaymentMethodInput): Promise<PaymentMethodResponse> {
    return this.prisma.paymentMethod.create({
      data: {
        name: data.name,
        providerKey: data.providerKey,
        description: data.description,
        icon: data.icon,
        color: data.color,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
        settings: data.settings
          ? {
              createMany: {
                data: data.settings.map((setting) => ({
                  key: setting.key,
                  value: setting.value,
                  isSecret: setting.isSecret ?? false,
                })),
              },
            }
          : undefined,
      },
      include: {
        settings: true,
      },
    });
  }

  async update(
    id: string,
    data: PaymentMethodInput,
  ): Promise<PaymentMethodResponse> {
    const existing = await this.prisma.paymentMethod.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Payment method not found');

    // Delete existing settings if new ones are provided
    if (data.settings) {
      await this.prisma.paymentSetting.deleteMany({
        where: { paymentMethodId: id },
      });
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.providerKey !== undefined)
      updateData.providerKey = data.providerKey;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    // Add settings if provided
    if (data.settings) {
      updateData.settings = {
        createMany: {
          data: data.settings.map((setting) => ({
            key: setting.key,
            value: setting.value,
            isSecret: setting.isSecret ?? false,
          })),
        },
      };
    }

    return this.prisma.paymentMethod.update({
      where: { id },
      data: updateData,
      include: {
        settings: true,
      },
    });
  }

  async delete(id: string): Promise<PaymentMethodResponse> {
    // Delete settings first due to foreign key constraint
    await this.prisma.paymentSetting.deleteMany({
      where: { paymentMethodId: id },
    });

    return this.prisma.paymentMethod.delete({
      where: { id },
      include: {
        settings: true,
      },
    });
  }

  async searchByText(q: string): Promise<PaymentMethodResponse[]> {
    return this.prisma.paymentMethod.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' as any } },
          { providerKey: { contains: q, mode: 'insensitive' as any } },
          { description: { contains: q, mode: 'insensitive' as any } },
        ],
      },
      include: {
        settings: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
