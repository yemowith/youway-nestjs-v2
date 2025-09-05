import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthAdminGuard } from 'src/api/auth/guards/jwt-auth-admin.guard';

@UseGuards(JwtAuthAdminGuard)
@ApiTags('Admin CMS Menus')
@Controller('admin/cms/menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.menusService.findAll(page, pageSize, search, sortBy, sortOrder);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.menusService.findById(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.menusService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.menusService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.menusService.delete(id);
  }
}
