import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SellerAppointmentService } from './seller-appointment.service';
import { GetDailySlotsDto, DailySlotsResponseDto } from './dto';

@ApiTags('Seller Appointments')
@Controller('seller-appointment')
export class SellerAppointmentController {
  constructor(
    private readonly sellerAppointmentService: SellerAppointmentService,
  ) {}

  @Get('daily-slots')
  @ApiOperation({
    summary: 'Get daily available slots for a seller',
    description:
      'Retrieve available time slots for a specific seller on a given date',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily slots retrieved successfully',
    type: DailySlotsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid parameters',
  })
  @ApiResponse({
    status: 404,
    description: 'Seller not found or no availability',
  })
  async getDailySlots(
    @Query(new ValidationPipe({ transform: true })) query: GetDailySlotsDto,
  ): Promise<DailySlotsResponseDto | null> {
    return await this.sellerAppointmentService.getDailySlotsForSeller(query);
  }
}
