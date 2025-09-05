import {
  Controller,
  Get,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { SellerService } from './seller.service';
import { SellerListQueryDto } from './dto/seller-list-query.dto';
import { ApiQuery, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  SellerListResponseDto,
  SellerProfileDto,
} from './dto/seller-response.dto';

@Controller('seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get()
  @ApiQuery({ type: SellerListQueryDto })
  @ApiResponse({ type: SellerListResponseDto })
  async listSellerProfiles(@Query() query: SellerListQueryDto) {
    return this.sellerService.listSellerProfiles(query);
  }

  @Get('therapies')
  @ApiResponse({ description: 'List of all seller profile therapies' })
  async listSellerTherapies() {
    return this.sellerService.listSellerTherapies();
  }

  @Get('therapy-schools')
  @ApiResponse({ description: 'List of all seller profile therapy schools' })
  async listSellerTherapySchools() {
    return this.sellerService.listSellerTherapySchools();
  }

  @Get(':slug')
  @ApiParam({ name: 'slug', description: 'Seller profile slug' })
  @ApiResponse({
    description: 'Get seller profile by slug',
    type: SellerProfileDto,
  })
  async getSellerProfileBySlug(@Param('slug') slug: string) {
    const sellerProfile = await this.sellerService.getSellerProfileBySlug(slug);
    if (!sellerProfile) {
      throw new NotFoundException('Seller profile not found');
    }
    return sellerProfile;
  }
}
