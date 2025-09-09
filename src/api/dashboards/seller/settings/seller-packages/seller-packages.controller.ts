import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SellerPackagesService } from './seller-packages.service';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { JwtSellerGuard } from 'src/api/auth/guards/jwt-seller.guard';
import { SellerPackageDto } from 'src/modules/seller/packages/dto';
import { UpdateSellerPackagesDto } from './dto/update-seller-packages.dto';

@ApiTags('Seller Packages')
@Controller('dashboard/seller/settings/packages')
export class SellerPackagesController {
  constructor(private readonly sellerPackagesService: SellerPackagesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get seller packages',
    description:
      'Retrieve all packages available to the seller with their pricing',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved seller packages',
    type: [SellerPackageDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found for seller',
  })
  async getSellerPackages(@Request() req: any): Promise<SellerPackageDto[]> {
    return this.sellerPackagesService.getSellerPackages(req.user.id as string);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update seller packages',
    description: 'Update pricing and availability for seller packages',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated seller packages',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found for seller',
  })
  async updateSellerPackages(
    @Request() req: any,
    @Body() updateDto: UpdateSellerPackagesDto,
  ): Promise<{ message: string }> {
    await this.sellerPackagesService.updateSellerPackages(
      req.user.id as string,
      updateDto.packages,
    );

    return {
      message: 'Seller packages updated successfully',
    };
  }
}
