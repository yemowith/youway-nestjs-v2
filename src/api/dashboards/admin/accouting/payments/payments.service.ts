import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: any[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    // Ensure proper type conversion for pagination parameters
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const pageSizeNum =
      typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    const skip = (pageNum - 1) * pageSizeNum;

    const where = search
      ? {
          OR: [
            { description: { contains: search, mode: 'insensitive' as any } },
            { transactionId: { contains: search, mode: 'insensitive' as any } },
            {
              appointment: {
                user: {
                  firstName: { contains: search, mode: 'insensitive' as any },
                },
              },
            },
            {
              appointment: {
                user: {
                  lastName: { contains: search, mode: 'insensitive' as any },
                },
              },
            },
            {
              paymentMethod: {
                name: { contains: search, mode: 'insensitive' as any },
              },
            },
          ],
        }
      : undefined;

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'amount',
        'currency',
        'status',
        'transactionId',
        'paidAt',
        'createdAt',
        'updatedAt',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        skip,
        take: pageSizeNum,
        where,
        orderBy,
        include: {
          paymentMethod: {
            select: {
              id: true,
              name: true,
              providerKey: true,
            },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize: pageSizeNum,
      page: pageNum,
    };
  }

  async findOne(id: string): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        paymentMethod: {
          select: {
            id: true,
            name: true,
            providerKey: true,
          },
        },
      },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(data: any): Promise<any> {
    return this.prisma.payment.create({
      data: {
        paymentMethodId: data.paymentMethodId,
        amount: data.amount,
        currency: data.currency || 'TRY',
        status: data.status || 'PENDING',
        transactionId: data.transactionId,
        description: data.description,
        paidAt: data.paidAt,
      },
      include: {
        paymentMethod: {
          select: {
            id: true,
            name: true,
            providerKey: true,
          },
        },
      },
    });
  }

  async update(id: string, data: any): Promise<any> {
    const existing = await this.prisma.payment.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Payment not found');

    const updateData: any = {};
    if (data.appointmentId !== undefined)
      updateData.appointmentId = data.appointmentId;
    if (data.paymentMethodId !== undefined)
      updateData.paymentMethodId = data.paymentMethodId;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.transactionId !== undefined)
      updateData.transactionId = data.transactionId;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.paidAt !== undefined) updateData.paidAt = data.paidAt;

    return this.prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        paymentMethod: {
          select: {
            id: true,
            name: true,
            providerKey: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<any> {
    const existing = await this.prisma.payment.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Payment not found');

    return this.prisma.payment.delete({
      where: { id },
      include: {
        paymentMethod: {
          select: {
            id: true,
            name: true,
            providerKey: true,
          },
        },
      },
    });
  }

  async searchByText(q: string): Promise<any[]> {
    return this.prisma.payment.findMany({
      where: {
        OR: [
          { description: { contains: q, mode: 'insensitive' as any } },
          { transactionId: { contains: q, mode: 'insensitive' as any } },

          {
            paymentMethod: {
              name: { contains: q, mode: 'insensitive' as any },
            },
          },
        ],
      },
      include: {
        paymentMethod: {
          select: {
            id: true,
            name: true,
            providerKey: true,
          },
        },
      },
      take: 10,
    });
  }
}
