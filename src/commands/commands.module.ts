import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { TesterCommand } from './tester/tester.command';
import { ClientsModule } from 'src/clients/clients.module';
import { ImportDbCommand } from './db/import-db';
import { HelpersModule } from 'src/helpers/helpers.module';
import { DatetimeModule } from 'src/helpers/datetime/datetime.module';
import { SeedSettingsCommand } from './db/seed-settings.command';
import { AppointmentsCommand } from './db/appoiment.command';
import { AvailabilityModule } from 'src/modules/seller/availability/availability.module';
import { LocationModule } from 'src/modules/user/location/location.module';
import { AppointmentModule } from 'src/modules/seller/appointment/appointment.module';
import { PackagesModule } from 'src/modules/seller/packages/packages.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CommissionModule } from 'src/modules/accounting/commission/commission.module';
import { AccountingModule } from 'src/modules/accounting/accounting.module';
import { PaymentModule } from 'src/api/app/payment/payment.module';
import { JwtModule } from '@nestjs/jwt';
import { FakeDbCommand } from './fake/fake.db.command';

import { NotifyUserModule } from 'src/providers/notify-user/notify-user.module';
import { UserModule } from 'src/modules/user/user.module';
import { ProcessAppointmentsModule } from 'src/modules/seller/appointment/process-appointments/process-appointments.module';
import { RoomsModule } from 'src/modules/rooms/rooms.module';

@Module({
  providers: [
    TesterCommand,
    ImportDbCommand,
    SeedSettingsCommand,
    AppointmentsCommand,
    FakeDbCommand,
  ],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    EventEmitterModule.forRoot(),
    ClientsModule,
    HelpersModule,
    DatetimeModule,
    AvailabilityModule,
    LocationModule,
    AppointmentModule,
    PackagesModule,
    CommissionModule,
    AccountingModule,
    PaymentModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    NotifyUserModule,
    UserModule,
    ProcessAppointmentsModule,
    RoomsModule,
  ],
})
export class CommandsModule {}
