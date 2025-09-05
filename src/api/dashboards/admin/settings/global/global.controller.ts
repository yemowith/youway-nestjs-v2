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
import { GlobalService } from './global.service';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthAdminGuard } from 'src/api/auth/guards/jwt-auth-admin.guard';

@UseGuards(JwtAuthAdminGuard)
@ApiTags('Admin Settings Global')
@Controller('admin/settings/global')
export class GlobalController {
  constructor(private readonly globalService: GlobalService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings with pagination and search' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'group', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('group') group?: string,
  ) {
    return this.globalService.findAll(
      page,
      pageSize,
      search,
      sortBy,
      sortOrder,
      group,
    );
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all settings grouped by their group' })
  async getSettingsByGroups() {
    return this.globalService.getSettingsByGroups();
  }

  @Get('group/:group')
  @ApiOperation({ summary: 'Get settings by specific group' })
  @ApiParam({ name: 'group', description: 'Settings group name' })
  async findByGroup(@Param('group') group: string) {
    return this.globalService.findByGroup(group);
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Get setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  async findByKey(@Param('key') key: string) {
    return this.globalService.findByKey(key);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  async findById(@Param('id') id: string) {
    return this.globalService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new setting' })
  async create(@Body() data: any) {
    return this.globalService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.globalService.update(id, data);
  }

  @Put('key/:key')
  @ApiOperation({ summary: 'Update setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  async updateByKey(@Param('key') key: string, @Body() data: any) {
    return this.globalService.updateByKey(key, data);
  }

  @Post('bulk-update')
  @ApiOperation({ summary: 'Bulk update multiple settings' })
  async bulkUpdate(@Body() settings: Array<{ key: string; value: string }>) {
    return this.globalService.bulkUpdate(settings);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete setting by ID' })
  @ApiParam({ name: 'id', description: 'Setting ID' })
  async delete(@Param('id') id: string) {
    return this.globalService.delete(id);
  }

  @Delete('key/:key')
  @ApiOperation({ summary: 'Delete setting by key' })
  @ApiParam({ name: 'key', description: 'Setting key' })
  async deleteByKey(@Param('key') key: string) {
    return this.globalService.deleteByKey(key);
  }
}
