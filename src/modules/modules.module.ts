import { Module } from '@nestjs/common'
import { AccountingModule } from './accounting/accounting.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { PaymentMethodsModule } from './payment-methods/payment-methods.module'
import { ChatModule } from './chat/chat.module'
import { UserModule } from './user/user.module'
import { SellerModule } from './seller/seller.module';

@Module({
  imports: [
    AccountingModule,
    EventEmitterModule,
    PaymentMethodsModule,
    ChatModule,
    UserModule,
    SellerModule,
  ],
  exports: [AccountingModule, UserModule],
})
export class ModulesModule {}
