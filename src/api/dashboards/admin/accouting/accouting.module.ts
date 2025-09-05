import { Module } from '@nestjs/common';
import { PaymentMethodsModule } from './payment-methods/payment-methods.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [PaymentMethodsModule, PaymentsModule],
})
export class AccoutingModule {}
