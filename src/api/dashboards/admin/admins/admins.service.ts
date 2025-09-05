import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class AdminsService {
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
    let where: any = {};
    if (search) {
      where = {
        OR: [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'createdAt',
        'updatedAt',
        'isSuperAdmin',
        'isActive',
        'userId',
        'id',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }
    const [data, total] = await Promise.all([
      this.prisma.admin.findMany({
        skip,
        take: pageSizeNum,
        where,
        orderBy,
        include: { user: true },
      }),
      this.prisma.admin.count({ where }),
    ]);
    return { rows: data, total, page, pageSize };
  }

  async findById(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async create(data: any) {
    return this.prisma.admin.create({ data });
  }

  async update(id: string, data: any) {
    // If isSuperAdmin is being set to false, check if this is the last super admin
    if (
      Object.prototype.hasOwnProperty.call(data, 'isSuperAdmin') &&
      data.isSuperAdmin === false
    ) {
      const admin = await this.prisma.admin.findUnique({ where: { id } });
      if (admin && admin.isSuperAdmin) {
        const superAdminCount = await this.prisma.admin.count({
          where: {
            isSuperAdmin: true,
            id: { not: id },
          },
        });
        if (superAdminCount === 0) {
          throw new BadRequestException(
            'Sistemde en az bir süper admin olmalıdır. Son süper admin devre dışı bırakılamaz.',
          );
        }
      }
    }
    // If isActive is being set to false, check if this is the last active super admin
    if (
      Object.prototype.hasOwnProperty.call(data, 'isActive') &&
      data.isActive === false
    ) {
      const admin = await this.prisma.admin.findUnique({ where: { id } });
      if (admin && admin.isSuperAdmin && admin.isActive) {
        const activeSuperAdminCount = await this.prisma.admin.count({
          where: {
            isSuperAdmin: true,
            isActive: true,
            id: { not: id },
          },
        });
        if (activeSuperAdminCount === 0) {
          throw new BadRequestException(
            'Sistemde en az bir aktif süper admin olmalıdır. Son aktif süper admin devre dışı bırakılamaz.',
          );
        }
      }
    }
    return this.prisma.admin.update({ where: { id }, data });
  }

  async delete(id: string) {
    // Fetch the admin to check if they are a super admin
    const admin = await this.prisma.admin.findUnique({ where: { id } });
    if (!admin) throw new Error('Admin not found');
    if (admin.isSuperAdmin) {
      // Count other super admins
      const superAdminCount = await this.prisma.admin.count({
        where: {
          isSuperAdmin: true,
          id: { not: id },
        },
      });
      if (superAdminCount === 0) {
        throw new BadRequestException(
          'Sistemde en az bir süper admin olmalıdır. Son süper admin silinemez.',
        );
      }
    }
    return this.prisma.admin.delete({ where: { id } });
  }
}
