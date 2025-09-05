import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { JwtModule } from '@nestjs/jwt';
import { AppointmentModule } from 'src/modules/seller/appointment/appointment.module';

@Module({
  providers: [OrderService],
  controllers: [OrderController],
  imports: [AppointmentModule],
  exports: [OrderService],
})
export class OrderModule {}
