import { Module } from '@nestjs/common';
import { SellerAppointmentService } from './seller-appointment.service';
import { AvailabilityModule } from 'src/modules/seller/availability/availability.module';
import { AppointmentModule } from 'src/modules/seller/appointment/appointment.module';
import { SellerAppointmentController } from './seller-appointment.controller';

@Module({
  providers: [SellerAppointmentService],
  imports: [AvailabilityModule, AppointmentModule],
  exports: [SellerAppointmentService],
  controllers: [SellerAppointmentController],
})
export class SellerAppointmentModule {}
