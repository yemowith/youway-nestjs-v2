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
import { AdminsService } from './admins.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthAdminGuard } from 'src/api/auth/guards/jwt-auth-admin.guard';

@UseGuards(JwtAuthAdminGuard)
@ApiTags('Admins')
@Controller('admin/admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.adminsService.findAll(
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.adminsService.findById(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.adminsService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.adminsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.adminsService.delete(id);
  }
}
