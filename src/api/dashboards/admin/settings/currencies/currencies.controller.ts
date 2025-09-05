import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Put,
  Delete,
} from '@nestjs/common'
import { CurrenciesService } from './currencies.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

// DTOs for Currency
export type CurrencyResponse = {
  code: string
  name: string
  symbol: string
  isoCode: string
  leftCode?: string | null
  rightCode?: string | null
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export type CurrencyInput = {
  code: string
  name: string
  symbol: string
  isoCode: string
  leftCode: string
  rightCode: string
  isDefault: boolean
}

@ApiTags('Admin - Currencies')
@Controller('admin/settings/currencies')
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all currencies' })
  async findAll(
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '10',
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    rows: CurrencyResponse[]
    total: number
    pageSize: number
    page: number
  }> {
    return this.currenciesService.findAll(
      Number(page),
      Number(pageSize),
      search,
      sortBy,
      sortOrder,
    )
  }

  @Get('search')
  @ApiOperation({ summary: 'Search currencies by text' })
  async searchCurrencies(@Query('q') q: string): Promise<CurrencyResponse[]> {
    if (!q || !q.trim()) return []
    return this.currenciesService.searchByText(q.trim())
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get currency by code' })
  async findOne(@Param('code') code: string): Promise<CurrencyResponse> {
    return this.currenciesService.findOne(code)
  }

  @Post()
  @ApiOperation({ summary: 'Create new currency' })
  async create(@Body() data: CurrencyInput): Promise<CurrencyResponse> {
    return this.currenciesService.create(data)
  }

  @Put(':code')
  @ApiOperation({ summary: 'Update currency' })
  async update(
    @Param('code') code: string,
    @Body() data: CurrencyInput,
  ): Promise<CurrencyResponse> {
    return this.currenciesService.update(code, data)
  }

  @Delete(':code')
  @ApiOperation({ summary: 'Delete currency' })
  async delete(@Param('code') code: string): Promise<CurrencyResponse> {
    return this.currenciesService.delete(code)
  }
}
