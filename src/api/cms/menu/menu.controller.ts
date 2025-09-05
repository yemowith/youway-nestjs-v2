import { Controller, Get } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('cms/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  async getAllMenus() {
    return this.menuService.getAllMenus();
  }
}
