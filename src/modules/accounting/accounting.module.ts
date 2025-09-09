import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from 'src/clients/prisma/prisma.module';
import { AccountingService } from './accounting.service';
import { TransactionService } from './transaction.service';
import { CommissionModule } from './commission/commission.module';

@Module({
  imports: [PrismaModule, forwardRef(() => CommissionModule)],
  providers: [AccountingService, TransactionService],
  exports: [AccountingService, TransactionService],
})
export class AccountingModule {}
