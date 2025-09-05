import { Injectable } from '@nestjs/common';
import { PageMenu } from '@prisma/client';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllMenus(): Promise<any[]> {
    return this.prisma.pageMenu.findMany({
      include: {
        items: {
          include: {
            page: {
              select: {
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }
}
