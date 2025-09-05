import { Module } from '@nestjs/common'

import { AccountingModule } from './accounting/accounting.module'
import { HomeModule } from './home/home.module'

@Module({
  imports: [AccountingModule, HomeModule],
})
export class SellerModule {}
