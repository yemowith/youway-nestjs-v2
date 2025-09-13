import { Module } from '@nestjs/common';
import { CountriesModule } from './countries/countries.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { GlobalModule } from './global/global.module';
import { QuestionsModule } from './questions/questions.module';

@Module({
  imports: [CountriesModule, CurrenciesModule, GlobalModule, QuestionsModule],
})
export class SettingsModule {}
