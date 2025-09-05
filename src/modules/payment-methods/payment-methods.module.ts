import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './payment-methods.service';
import { PaymentMethodsController } from './payment-methods.controller';
import { PayTrModule } from './pay-tr/pay-tr.module';

@Module({
  providers: [PaymentMethodsService],
  controllers: [PaymentMethodsController],
  imports: [PayTrModule]
})
export class PaymentMethodsModule {}
