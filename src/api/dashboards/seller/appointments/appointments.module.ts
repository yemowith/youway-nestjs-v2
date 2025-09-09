import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { PrismaModule } from 'src/clients/prisma/prisma.module';
import { PackagesModule } from 'src/modules/seller/packages/packages.module';
import { AvatarModule } from 'src/modules/user/avatar/avatar.module';

@Module({
  imports: [PrismaModule, PackagesModule, AvatarModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
