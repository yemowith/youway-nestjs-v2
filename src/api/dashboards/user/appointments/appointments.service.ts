import { Injectable } from '@nestjs/common';
import { AppointmentService } from 'src/modules/seller/appointment/appointment.service';
import { AppointmentResponseDto } from 'src/modules/seller/appointment/dto/appointment-response.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly appointmentService: AppointmentService) {}

  async getUserAppointments(userId: string): Promise<AppointmentResponseDto[]> {
    return this.appointmentService.getUserAppointments(userId);
  }
}
