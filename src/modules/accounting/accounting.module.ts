import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/clients/prisma/prisma.module';
import { AccountingService } from './accounting.service';
import { TransactionService } from './transaction.service';

@Module({
  imports: [PrismaModule],
  providers: [AccountingService, TransactionService],
  exports: [AccountingService, TransactionService],
})
export class AccountingModule {}
