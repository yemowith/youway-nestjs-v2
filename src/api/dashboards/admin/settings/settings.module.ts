import { Module } from '@nestjs/common';
import { CountriesModule } from './countries/countries.module';
import { CurrenciesModule } from './currencies/currencies.module';

@Module({
  imports: [CountriesModule, CurrenciesModule],
})
export class SettingsModule {}
