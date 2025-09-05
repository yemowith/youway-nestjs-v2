import { Injectable } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class PagesService {
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
        'slug',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }
    const [data, total] = await Promise.all([
      this.prisma.page.findMany({
        skip,
        take: pageSizeNum,
        where,
        orderBy,
        include: {
          category: true,
        },
      }),
      this.prisma.page.count({ where }),
    ]);
    return { rows: data, total, page, pageSize };
  }

  async findById(id: string) {
    return this.prisma.page.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async searchByText(searchText: string) {
    return this.prisma.page.findMany({
      where: {
        title: { contains: searchText, mode: 'insensitive' as const },
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        category: true,
      },
    });
  }

  async create(data: any) {
    const slug = slugify(data.title, { lower: true });
    return this.prisma.page.create({
      data: {
        ...data,
        slug,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.page.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.page.delete({ where: { id } });
  }
}
