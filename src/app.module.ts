import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule } from './clients/clients.module';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { ModulesModule } from './modules/modules.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { HelpersModule } from './helpers/helpers.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ClientsModule,
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ModulesModule,
    EventEmitterModule.forRoot(),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    HelpersModule,
    ApiModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
