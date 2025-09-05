import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { PageResponseDto } from './dto';

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySlug(slug: string): Promise<PageResponseDto> {
    const page = await this.prisma.page.findUnique({
      where: { slug },
      include: {
        category: true,
      },
    });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const pagesInCategory = await this.prisma.page.findMany({
      where: { categoryId: page.categoryId, status: 'published' },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        image: true,
      },
    });

    return {
      ...page,
      pagesInCategory,
    };
  }
}
