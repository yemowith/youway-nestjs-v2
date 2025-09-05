import { Module, forwardRef } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PayTrModule } from 'src/modules/payment-methods/pay-tr/pay-tr.module';

@Module({
  imports: [forwardRef(() => PayTrModule)],
  providers: [PaymentService],
  controllers: [PaymentController],
  exports: [PaymentService],
})
export class PaymentModule {}
