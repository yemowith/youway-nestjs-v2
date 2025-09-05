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
import { PagesService } from './pages.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthAdminGuard } from 'src/api/auth/guards/jwt-auth-admin.guard';

@UseGuards(JwtAuthAdminGuard)
@ApiTags('Admin CMS Pages')
@Controller('admin/cms/pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('search')
  async searchByText(@Query('q') query: string) {
    return this.pagesService.searchByText(query);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.pagesService.findAll(page, pageSize, search, sortBy, sortOrder);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.pagesService.findById(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.pagesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.pagesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.pagesService.delete(id);
  }
}
