import { Module } from '@nestjs/common';
import { CountriesModule } from './countries/countries.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { GlobalModule } from './global/global.module';

@Module({
  imports: [CountriesModule, CurrenciesModule, GlobalModule],
})
export class SettingsModule {}
