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
import { CountriesService } from './countries.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// DTOs for Country
export type CountryResponse = {
  id: string;
  name: string;
  code: string;
  currencyCode: string;
  timezone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CountryInput = {
  name: string;
  code: string;
  currencyCode: string;
  timezone: string;
  isDefault: boolean;
};

@ApiTags('Admin - Countries')
@Controller('admin/settings/countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all countries' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: CountryResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    return this.countriesService.findAll(
      Number(page),
      Number(pageSize),
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search countries by text' })
  async searchCountries(@Query('q') q: string): Promise<CountryResponse[]> {
    if (!q || !q.trim()) return [];
    return this.countriesService.searchByText(q.trim());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get country by ID' })
  async findOne(@Param('id') id: string): Promise<CountryResponse> {
    return this.countriesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new country' })
  async create(@Body() data: CountryInput): Promise<CountryResponse> {
    return this.countriesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update country' })
  async update(
    @Param('id') id: string,
    @Body() data: CountryInput,
  ): Promise<CountryResponse> {
    return this.countriesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete country' })
  async delete(@Param('id') id: string): Promise<CountryResponse> {
    return this.countriesService.delete(id);
  }
}
