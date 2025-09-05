import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

export type ApplicationResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseName: string;
  highLevelLicense: boolean;
  areaExpertise: string;
  cvUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ApplicationInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  licenseName: string;
  highLevelLicense?: boolean;
  areaExpertise: string;
};

@ApiTags('Application')
@Controller('admin/application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all applications with pagination, search and sorting',
  })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: ApplicationResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    return this.applicationService.findAll(
      Number(page),
      Number(pageSize),
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  async findOne(@Param('id') id: string): Promise<ApplicationResponse> {
    return this.applicationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new application' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cv'))
  async create(
    @Body() data: ApplicationInput,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApplicationResponse> {
    return this.applicationService.create(data, file);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('cv'))
  async update(
    @Param('id') id: string,
    @Body() data: ApplicationInput,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApplicationResponse> {
    return this.applicationService.update(id, data, file);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  async delete(@Param('id') id: string): Promise<ApplicationResponse> {
    return this.applicationService.delete(id);
  }
}
