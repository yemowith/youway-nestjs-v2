import { Module } from '@nestjs/common';
import { RecovryController } from './recovry.controller';
import { RecovryService } from './recovry.service';
import { PrismaModule } from '../../../clients/prisma/prisma.module';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [PrismaModule, OtpModule],
  controllers: [RecovryController],
  providers: [RecovryService],
  exports: [RecovryService],
})
export class RecovryModule {}
