import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { MenuService } from '../cms/menu/menu.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menuService: MenuService,
  ) {}

  async getSettings() {
    const settings = await this.prisma.setting.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        key: true,
        value: true,
        type: true,
        group: true,
      },
    });
    return settings;
  }

  async getSetting(key: string) {
    const setting = await this.prisma.setting.findUnique({
      where: { key },
    });
    return setting;
  }

  async getMenus() {
    const menus = await this.menuService.getAllMenus();
    return menus;
  }

  async getCountries() {
    const countries = await this.prisma.country.findMany({
      include: {
        currency: true,
      },
    });
    return countries;
  }

  async getApp() {
    const settings = await this.getSettings();
    const menus = await this.getMenus();
    const countries = await this.getCountries();
    const app = {
      settings,
      menus,
      countries,
    };
    return app;
  }
}
