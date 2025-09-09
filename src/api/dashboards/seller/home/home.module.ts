import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { CommissionModule } from 'src/modules/accounting/commission/commission.module';
import { RatingModule } from 'src/api/app/seller/rating/rating.module';
import { ChatModule } from 'src/modules/chat/chat.module';

@Module({
  providers: [HomeService],
  controllers: [HomeController],
  imports: [CommissionModule, RatingModule, ChatModule],
})
export class HomeModule {}
