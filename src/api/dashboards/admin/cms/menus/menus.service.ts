import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class MenusService {
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
      const allowedSortFields = ['title', 'createdAt', 'updatedAt', 'id'];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }
    const [data, total] = await Promise.all([
      this.prisma.pageMenu.findMany({
        skip,
        take: pageSizeNum,
        where,
        orderBy,
        include: {
          items: {
            include: {
              page: true,
            },
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      }),
      this.prisma.pageMenu.count({ where }),
    ]);
    return { rows: data, total, page, pageSize };
  }

  async findById(id: string) {
    return this.prisma.pageMenu.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            page: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  }

  async create(data: any) {
    const { menuItems, ...menuData } = data;

    return this.prisma.pageMenu.create({
      data: {
        ...menuData,
        items: menuItems
          ? {
              create: menuItems.map((item: any) => ({
                titleItem: item.titleItem,
                link: item.link,
                pageId: item.pageId,
                sortOrder: item.sortOrder,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            page: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    const { menuItems, ...menuData } = data;

    return this.prisma.pageMenu.update({
      where: { id },
      data: {
        ...menuData,
        items: menuItems
          ? {
              deleteMany: {},
              create: menuItems.map((item: any) => ({
                titleItem: item.titleItem,
                link: item.link,
                pageId: item.pageId,
                sortOrder: item.sortOrder,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            page: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.pageMenu.delete({ where: { id } });
  }
}
