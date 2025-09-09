import { forwardRef, Module } from '@nestjs/common';
import { CommissionService } from './commission.service';
import { AccountingModule } from '../accounting.module';

@Module({
  providers: [CommissionService],
  exports: [CommissionService],
  imports: [forwardRef(() => AccountingModule)],
})
export class CommissionModule {}
