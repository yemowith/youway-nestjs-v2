import { Module } from '@nestjs/common'
import { TherapyModule } from './therapy/therapy.module'
import { TherapySchoolModule } from './therapy-school/therapy-school.module'

@Module({
  imports: [TherapyModule, TherapySchoolModule],
})
export class DefintionsModule {}
