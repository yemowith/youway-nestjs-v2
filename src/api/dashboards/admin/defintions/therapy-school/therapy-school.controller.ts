import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common';
import { TherapySchoolService } from './therapy-school.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

export type TherapySchoolResponse = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TherapySchoolInput = {
  name: string;
  description?: string | null;
};

@ApiTags('Admin - Therapy School')
@Controller('admin/therapy-school')
export class TherapySchoolController {
  constructor(private readonly therapySchoolService: TherapySchoolService) {}

  @Get()
  @ApiOperation({ summary: 'Get all therapy schools' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: TherapySchoolResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    return this.therapySchoolService.findAll(
      Number(page),
      Number(pageSize),
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search therapy schools by text' })
  async searchTherapySchools(
    @Query('q') q: string,
  ): Promise<TherapySchoolResponse[]> {
    if (!q || !q.trim()) return [];
    return this.therapySchoolService.searchByText(q.trim());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get therapy school by ID' })
  async findOne(@Param('id') id: string): Promise<TherapySchoolResponse> {
    return this.therapySchoolService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new therapy school' })
  async create(
    @Body() data: TherapySchoolInput,
  ): Promise<TherapySchoolResponse> {
    return this.therapySchoolService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update therapy school' })
  async update(
    @Param('id') id: string,
    @Body() data: TherapySchoolInput,
  ): Promise<TherapySchoolResponse> {
    return this.therapySchoolService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete therapy school' })
  async delete(@Param('id') id: string): Promise<TherapySchoolResponse> {
    return this.therapySchoolService.delete(id);
  }
}
