import { Module } from '@nestjs/common'

import { AccountingModule } from './accounting/accounting.module'
import { HomeModule } from './home/home.module'
import { AppointmentsModule } from './appointments/appointments.module';
import { UsersModule } from './users/users.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [AccountingModule, HomeModule, AppointmentsModule, UsersModule, SettingsModule],
})
export class SellerModule {}
