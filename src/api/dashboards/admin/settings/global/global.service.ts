import { Injectable } from '@nestjs/common';
import { CacheService } from 'src/clients/cache/cache.service';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class GlobalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(
    page = 1,
    pageSize = 20,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    group?: string,
  ) {
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const pageSizeNum =
      typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    const skip = (pageNum - 1) * pageSizeNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { key: { contains: search, mode: 'insensitive' as const } },
        { value: { contains: search, mode: 'insensitive' as const } },
        { group: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    if (group) {
      where.group = group;
    }

    // Build order by clause
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      const allowedSortFields = [
        'key',
        'value',
        'group',
        'type',
        'createdAt',
        'updatedAt',
        'id',
      ];
      if (allowedSortFields.includes(sortBy)) {
        orderBy = { [sortBy]: sortOrder };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.setting.findMany({
        skip,
        take: pageSizeNum,
        where,
        orderBy,
      }),
      this.prisma.setting.count({ where }),
    ]);

    return { rows: data, total, page: pageNum, pageSize: pageSizeNum };
  }

  async findById(id: string) {
    return this.prisma.setting.findUnique({ where: { id } });
  }

  async findByKey(key: string) {
    return this.prisma.setting.findUnique({ where: { key } });
  }

  async findByGroup(group: string) {
    return this.prisma.setting.findMany({
      where: { group },
      orderBy: { key: 'asc' },
    });
  }

  async create(data: any) {
    await this.cacheService.del('app');
    return this.prisma.setting.create({ data });
  }

  async update(id: string, data: any) {
    await this.cacheService.del('app');
    return this.prisma.setting.update({ where: { id }, data });
  }

  async updateByKey(key: string, data: any) {
    await this.cacheService.del('app');
    return this.prisma.setting.update({ where: { key }, data });
  }

  async delete(id: string) {
    await this.cacheService.del('app');
    return this.prisma.setting.delete({ where: { id } });
  }

  async deleteByKey(key: string) {
    await this.cacheService.del('app');
    return this.prisma.setting.delete({ where: { key } });
  }

  async getSettingsByGroups() {
    const settings = await this.prisma.setting.findMany({
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });

    // Group settings by their group
    const groupedSettings: Record<string, any[]> = {};
    settings.forEach((setting) => {
      if (!groupedSettings[setting.group]) {
        groupedSettings[setting.group] = [];
      }
      groupedSettings[setting.group].push(setting);
    });

    return groupedSettings;
  }

  async bulkUpdate(settings: Array<{ key: string; value: string }>) {
    await this.cacheService.del('app');

    const updates = settings.map((setting) =>
      this.prisma.setting.update({
        where: { key: setting.key },
        data: { value: setting.value },
      }),
    );

    return this.prisma.$transaction(updates);
  }
}
