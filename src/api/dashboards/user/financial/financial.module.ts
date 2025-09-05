import { Module } from '@nestjs/common';
import { FinancialService } from './financial.service';
import { FinancialController } from './financial.controller';
import { AccountingModule } from 'src/modules/accounting/accounting.module';
import { LocationModule } from 'src/modules/user/location/location.module';

@Module({
  providers: [FinancialService],
  controllers: [FinancialController],
  imports: [AccountingModule, LocationModule],
})
export class FinancialModule {}
