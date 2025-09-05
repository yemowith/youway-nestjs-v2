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

@Module({
  providers: [
    TesterCommand,
    ImportDbCommand,
    SeedSettingsCommand,
    AppointmentsCommand,
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
  ],
})
export class CommandsModule {}
