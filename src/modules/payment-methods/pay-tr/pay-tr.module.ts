import { Module, forwardRef } from '@nestjs/common';
import { PayTrService } from './pay-tr.service';
import { PayTrController } from './pay-tr.controller';
import { OrderModule } from 'src/api/app/order/order.module';
import { PaymentModule } from 'src/api/app/payment/payment.module';

@Module({
  imports: [OrderModule, forwardRef(() => PaymentModule)],
  providers: [PayTrService],
  controllers: [PayTrController],
  exports: [PayTrService],
})
export class PayTrModule {}
