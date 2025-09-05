import { Module } from '@nestjs/common';
import { TherapySchoolService } from './therapy-school.service';
import { TherapySchoolController } from './therapy-school.controller';

@Module({
  providers: [TherapySchoolService],
  controllers: [TherapySchoolController]
})
export class TherapySchoolModule {}
