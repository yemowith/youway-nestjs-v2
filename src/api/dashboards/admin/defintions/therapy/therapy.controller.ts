import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { TherapyService } from './therapy.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// DTOs for Therapy
export type TherapyResponse = {
  id: string;
  name: string;
  description?: string | null;
  therapySchoolId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TherapyInput = {
  name: string;
  description?: string | null;
  therapySchoolId?: string | null;
};

@ApiTags('Admin - Therapy')
@Controller('admin/therapy')
export class TherapyController {
  constructor(private readonly therapyService: TherapyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all therapies' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: TherapyResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    return this.therapyService.findAll(
      Number(page),
      Number(pageSize),
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search therapies by text' })
  async searchTherapies(@Query('q') q: string): Promise<TherapyResponse[]> {
    if (!q || !q.trim()) return [];
    return this.therapyService.searchByText(q.trim());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get therapy by ID' })
  async findOne(@Param('id') id: string): Promise<TherapyResponse> {
    return this.therapyService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new therapy' })
  async create(@Body() data: TherapyInput): Promise<TherapyResponse> {
    return this.therapyService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update therapy' })
  async update(
    @Param('id') id: string,
    @Body() data: TherapyInput,
  ): Promise<TherapyResponse> {
    return this.therapyService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete therapy' })
  async delete(@Param('id') id: string): Promise<TherapyResponse> {
    return this.therapyService.delete(id);
  }
}
