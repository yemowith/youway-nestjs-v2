import { Module } from '@nestjs/common';
import { SellersService } from './sellers.service';
import { SellersController } from './sellers.controller';
import { RatingModule } from 'src/api/app/seller/rating/rating.module';
import { PackagesModule } from 'src/modules/seller/packages/packages.module';
import { AvatarsModule } from '../profiles/avatars/avatars.module';
import { PrismaModule } from 'src/clients/prisma/prisma.module';

@Module({
  providers: [SellersService],
  controllers: [SellersController],
  imports: [RatingModule, AvatarsModule, PackagesModule, PrismaModule],
  exports: [SellersService],
})
export class SellersModule {}
