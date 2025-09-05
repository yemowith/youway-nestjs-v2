import { Module } from '@nestjs/common';
import { TherapyService } from './therapy.service';
import { TherapyController } from './therapy.controller';

@Module({
  providers: [TherapyService],
  controllers: [TherapyController]
})
export class TherapyModule {}
