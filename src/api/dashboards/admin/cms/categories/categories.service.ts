import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 20,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const pageSizeNum =
      typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    const skip = (pageNum - 1) * pageSizeNum;
    const where = search
      ? { title: { contains: search, mode: 'insensitive' as const } }
      : undefined;
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'title',
        'createdAt',
        'updatedAt',
        'id',
        'sortOrder',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }
    const [data, total] = await Promise.all([
      this.prisma.pageCategory.findMany({
        skip,
        take: pageSizeNum,
        where,
        orderBy,
      }),
      this.prisma.pageCategory.count({ where }),
    ]);
    return { rows: data, total, page, pageSize };
  }

  async findById(id: string) {
    return this.prisma.pageCategory.findUnique({ where: { id } });
  }

  async searchByText(searchText: string) {
    return this.prisma.pageCategory.findMany({
      where: {
        title: { contains: searchText, mode: 'insensitive' as const },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.pageCategory.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.pageCategory.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.pageCategory.delete({ where: { id } });
  }
}
