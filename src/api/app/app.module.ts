import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { SellerModule } from './seller/seller.module';
import { SellerAppointmentModule } from './seller-appointment/seller-appointment.module';
import { OrderModule } from './order/order.module';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { MenuModule } from '../cms/menu/menu.module';
import { AppController } from './app.controller';
import { AiModule } from './ai/ai.module';

@Module({
  providers: [AppService],
  imports: [
    SellerModule,
    SellerAppointmentModule,
    OrderModule,
    PaymentMethodsModule,
    MenuModule,
    AiModule,
  ],
  exports: [SellerModule],
  controllers: [AppController],
})
export class AppModule {}
