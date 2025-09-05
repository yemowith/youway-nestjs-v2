import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

import { AppointmentResponseDto } from 'src/modules/seller/appointment/dto/appointment-response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';

@Controller('dashboards/user/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  async getUserAppointments(
    @Request() req: any,
  ): Promise<AppointmentResponseDto[]> {
    const userId = req.user.id;
    return this.appointmentsService.getUserAppointments(userId);
  }
}
