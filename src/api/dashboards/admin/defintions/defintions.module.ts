import { Module } from '@nestjs/common';
import { TherapyModule } from './therapy/therapy.module';
import { TherapySchoolModule } from './therapy-school/therapy-school.module';
import { PackagesModule } from './packages/packages.module';

@Module({
  imports: [TherapyModule, TherapySchoolModule, PackagesModule],
})
export class DefintionsModule {}
