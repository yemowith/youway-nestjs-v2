import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SellerAvailabilityService } from './seller-availability.service';
import {
  UpdateAvailabilitySettingsDto,
  SellerAvailabilityResponseDto,
  CreateSellerUnavailabilityDto,
  SellerUnavailabilityResponseDto,
} from 'src/api/dashboards/seller/settings/seller-availability/dto/availability-settings.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { JwtSellerGuard } from 'src/api/auth/guards/jwt-seller.guard';

@ApiTags('Seller Availability Settings')
@Controller('dashboard/seller/settings/availability')
export class SellerAvailabilityController {
  constructor(
    private readonly sellerAvailabilityService: SellerAvailabilityService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get seller availability settings',
    description:
      'Retrieve current availability settings including weekly schedule, unavailability periods, and appointment settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved availability settings',
    type: SellerAvailabilityResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found for seller',
  })
  async getAvailabilitySettings(
    @Request() req: any,
  ): Promise<SellerAvailabilityResponseDto> {
    return this.sellerAvailabilityService.getAvailabilitySettings(
      req.user.id as string,
    );
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update seller availability settings',
    description: 'Update weekly availability schedule and appointment settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated availability settings',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found for seller',
  })
  async updateAvailabilitySettings(
    @Request() req: any,
    @Body() updateDto: UpdateAvailabilitySettingsDto,
  ): Promise<{ message: string }> {
    await this.sellerAvailabilityService.updateAvailabilitySettings(
      req.user.id as string,
      updateDto,
    );

    return {
      message: 'Availability settings updated successfully',
    };
  }

  @Get('unavailability')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get seller unavailability periods',
    description: 'Retrieve all future unavailability periods for the seller',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved unavailability periods',
    type: [SellerUnavailabilityResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Location not found for seller',
  })
  async getSellerUnavailability(
    @Request() req: any,
  ): Promise<SellerUnavailabilityResponseDto[]> {
    return this.sellerAvailabilityService.getSellerUnavailability(
      req.user.id as string,
    );
  }

  @Post('unavailability')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create seller unavailability period',
    description: 'Create a new unavailability period for the seller',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully created unavailability period',
    type: SellerUnavailabilityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or validation error',
  })
  async createSellerUnavailability(
    @Request() req: any,
    @Body() createDto: CreateSellerUnavailabilityDto,
  ): Promise<SellerUnavailabilityResponseDto> {
    return this.sellerAvailabilityService.createSellerUnavailability(
      req.user.id as string,
      createDto,
    );
  }

  @Delete('unavailability/:id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete seller unavailability period',
    description: 'Delete an existing unavailability period for the seller',
  })
  @ApiParam({
    name: 'id',
    description: 'Unavailability period ID',
    example: 'uuid-string',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted unavailability period',
  })
  @ApiResponse({
    status: 400,
    description: 'Unavailability period not found or does not belong to seller',
  })
  @ApiResponse({
    status: 404,
    description: 'Unavailability period not found',
  })
  async deleteSellerUnavailability(
    @Request() req: any,
    @Param('id') unavailabilityId: string,
  ): Promise<{ message: string }> {
    await this.sellerAvailabilityService.deleteSellerUnavailability(
      req.user.id as string,
      unavailabilityId,
    );

    return {
      message: 'Unavailability period deleted successfully',
    };
  }
}
