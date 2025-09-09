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
import { PackagesService } from './packages.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

// DTOs for Package
export type PackagePriceResponse = {
  id: string;
  packageId: string;
  priceMin: any; // Decimal type from Prisma
  priceMax: any; // Decimal type from Prisma
  isFree: boolean;
  currencyCode: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PackagePriceInput = {
  priceMin: number;
  priceMax: number;
  isFree?: boolean;
  currencyCode: string;
};

export type PackageResponse = {
  id: string;
  name: string;
  durationMin: number;
  commission?: any; // Decimal type from Prisma
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  isFree: boolean;
  recommended: boolean;
  sortOrder: number;
  canBeReplayed: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  prices?: PackagePriceResponse[];
};

export type PackageInput = {
  name: string;
  durationMin: number;
  commission?: number | null;
  image?: string | null;
  icon?: string | null;
  color?: string | null;
  isFree?: boolean;
  recommended?: boolean;
  sortOrder?: number;
  canBeReplayed?: boolean;
  isActive?: boolean;
  prices?: PackagePriceInput[];
};

@ApiTags('Admin - Packages')
@Controller('admin/packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all packages' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: PackageResponse[];
    total: number;
    pageSize: number;
    page: number;
  }> {
    return this.packagesService.findAll(
      Number(page),
      Number(pageSize),
      search,
      sortBy,
      sortOrder,
    );
  }

  @Get('search')
  @ApiOperation({ summary: 'Search packages by text' })
  async searchPackages(@Query('q') q: string): Promise<PackageResponse[]> {
    if (!q || !q.trim()) return [];
    return this.packagesService.searchByText(q.trim());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package by ID' })
  async findOne(@Param('id') id: string): Promise<PackageResponse> {
    return this.packagesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new package' })
  async create(@Body() data: PackageInput): Promise<PackageResponse> {
    return this.packagesService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update package' })
  async update(
    @Param('id') id: string,
    @Body() data: PackageInput,
  ): Promise<PackageResponse> {
    return this.packagesService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete package' })
  async delete(@Param('id') id: string): Promise<PackageResponse> {
    return this.packagesService.delete(id);
  }

  // Package Price Management Endpoints
  @Get(':id/prices')
  @ApiOperation({ summary: 'Get package prices' })
  async getPackagePrices(
    @Param('id') id: string,
  ): Promise<PackagePriceResponse[]> {
    return this.packagesService.getPackagePrices(id);
  }

  @Post(':id/prices')
  @ApiOperation({ summary: 'Add package price' })
  async addPackagePrice(
    @Param('id') id: string,
    @Body() priceData: PackagePriceInput,
  ): Promise<PackagePriceResponse> {
    return this.packagesService.addPackagePrice(id, priceData);
  }

  @Put('prices/:priceId')
  @ApiOperation({ summary: 'Update package price' })
  async updatePackagePrice(
    @Param('priceId') priceId: string,
    @Body() priceData: PackagePriceInput,
  ): Promise<PackagePriceResponse> {
    return this.packagesService.updatePackagePrice(priceId, priceData);
  }

  @Delete('prices/:priceId')
  @ApiOperation({ summary: 'Delete package price' })
  async deletePackagePrice(
    @Param('priceId') priceId: string,
  ): Promise<PackagePriceResponse> {
    return this.packagesService.deletePackagePrice(priceId);
  }
}
