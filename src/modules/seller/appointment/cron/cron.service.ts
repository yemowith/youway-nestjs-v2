import { Injectable } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';
import { ProcessAppointmentsService } from '../process-appointments/process-appointments.service';

@Injectable()
export class CronService {
  constructor(
    private readonly processAppointmentsService: ProcessAppointmentsService,
  ) {}

  async checkEndedAppointments() {
    console.log('Checking ended appointments');
    await this.processAppointmentsService.processAppointments();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    console.log('Cron job executed');
    await this.checkEndedAppointments();
  }
}
