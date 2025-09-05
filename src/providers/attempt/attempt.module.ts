import { Module } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { PrismaModule } from 'src/clients/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AttemptService],
  exports: [AttemptService],
})
export class AttemptModule {}
