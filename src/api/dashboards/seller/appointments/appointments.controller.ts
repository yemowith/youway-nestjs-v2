import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  AppointmentsService,
  AppointmentFilters,
  PaginationParams,
  PaginatedAppointmentsResponse,
} from './appointments.service';
import { AppointmentResponseDto } from 'src/modules/seller/appointment/dto/appointment-response.dto';
import { AppointmentStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';
import { JwtSellerGuard } from 'src/api/auth/guards/jwt-seller.guard';

@ApiTags('Seller Appointments')
@Controller('dashboard/seller/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get seller appointments with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved appointments',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['startTime', 'createdAt', 'status'],
    description: 'Sort field (default: startTime)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: ['asc', 'desc'],
    description: 'Sort order (default: desc)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
    description: 'Filter by appointment status',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter appointments from this date (ISO string)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter appointments until this date (ISO string)',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by specific user ID',
  })
  @ApiQuery({
    name: 'packageId',
    required: false,
    type: String,
    description: 'Filter by specific package ID',
  })
  async getAppointments(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: 'startTime' | 'createdAt' | 'status',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('status') status?: AppointmentStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('packageId') packageId?: string,
  ): Promise<PaginatedAppointmentsResponse> {
    const filters: AppointmentFilters = {
      status,
      startDate,
      endDate,
      userId,
      packageId,
    };

    const pagination: PaginationParams = {
      page,
      limit,
      sortBy,
      sortOrder,
    };

    return this.appointmentsService.getSellerAppointments(
      req.user.id as string,
      filters,
      pagination,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get appointment statistics for seller' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved appointment statistics',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: 'Total appointments' },
        scheduled: { type: 'number', description: 'Scheduled appointments' },
        completed: { type: 'number', description: 'Completed appointments' },
        cancelled: { type: 'number', description: 'Cancelled appointments' },
        pending: { type: 'number', description: 'Pending appointments' },
      },
    },
  })
  async getAppointmentStats(@Request() req: any) {
    return this.appointmentsService.getAppointmentStats(req.user.id as string);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseGuards(JwtSellerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get specific appointment by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved appointment',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Appointment not found',
  })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  async getAppointmentById(
    @Request() req: any,
    @Param('id') appointmentId: string,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentsService.getAppointmentById(
      appointmentId,
      req.user.id as string,
    );
  }
}
