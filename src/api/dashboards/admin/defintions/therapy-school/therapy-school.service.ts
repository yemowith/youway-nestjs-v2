import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import {
  TherapySchoolInput,
  TherapySchoolResponse,
} from './therapy-school.controller';

@Injectable()
export class TherapySchoolService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 10,
    search?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: TherapySchoolResponse[];
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
      this.prisma.therapySchool.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
      }),
      this.prisma.therapySchool.count({ where }),
    ]);

    return {
      rows: data,
      total,
      pageSize,
      page,
    };
  }

  async findOne(id: string): Promise<TherapySchoolResponse> {
    const school = await this.prisma.therapySchool.findUnique({
      where: { id },
    });
    if (!school) throw new NotFoundException('Therapy school not found');
    return school;
  }

  async create(data: TherapySchoolInput): Promise<TherapySchoolResponse> {
    const { name, description } = data;
    return this.prisma.therapySchool.create({ data: { name, description } });
  }

  async update(
    id: string,
    data: TherapySchoolInput,
  ): Promise<TherapySchoolResponse> {
    const existing = await this.prisma.therapySchool.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Therapy school not found');
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    return this.prisma.therapySchool.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string): Promise<TherapySchoolResponse> {
    return this.prisma.therapySchool.delete({ where: { id } });
  }

  async searchByText(q: string): Promise<TherapySchoolResponse[]> {
    return this.prisma.therapySchool.findMany({
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
