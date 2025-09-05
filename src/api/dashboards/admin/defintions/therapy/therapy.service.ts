import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { TherapyInput, TherapyResponse } from './therapy.controller';

@Injectable()
export class TherapyService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: TherapyResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : undefined;

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = ['name', 'createdAt', 'updatedAt'];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.therapy.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
      }),
      this.prisma.therapy.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string): Promise<TherapyResponse> {
    const therapy = await this.prisma.therapy.findUnique({ where: { id } });
    if (!therapy) throw new NotFoundException('Therapy not found');
    return therapy;
  }

  async create(data: TherapyInput): Promise<TherapyResponse> {
    const { name, description } = data;
    return this.prisma.therapy.create({ data: { name, description } });
  }

  async update(id: string, data: TherapyInput): Promise<TherapyResponse> {
    const existing = await this.prisma.therapy.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Therapy not found');
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    return this.prisma.therapy.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<TherapyResponse> {
    return this.prisma.therapy.delete({ where: { id } });
  }

  async searchByText(q: string): Promise<TherapyResponse[]> {
    return this.prisma.therapy.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }
}
