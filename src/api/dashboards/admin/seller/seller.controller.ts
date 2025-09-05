import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('admin/seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.sellerService.findAll({
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sellerService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateSellerDto) {
    return this.sellerService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSellerDto,
  ) {
    return this.sellerService.update(id, dto);
  }

  @Put(':id/password')
  async changePassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.sellerService.changePassword(id, dto.newPassword);
  }

  @Delete(':id')
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sellerService.delete(id);
  }

  @Get('test/:id')
  async test(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.sellerService.findOne(id);
  }
}
