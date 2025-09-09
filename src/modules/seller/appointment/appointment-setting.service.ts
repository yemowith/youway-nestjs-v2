import { Injectable } from '@nestjs/common';
import { AppointmentStatus, SellerSetting } from '@prisma/client';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { LocationService } from 'src/modules/user/location/location.service';
import { DatetimeService } from 'src/helpers/datetime/datetime.service';

@Injectable()
export class AppointmentSettingService {
  constructor(private readonly prisma: PrismaService) {}

  async getSetting(sellerId: string) {
    const setting = await this.prisma.sellerSetting.findUnique({
      where: {
        sellerId: sellerId,
      },
    });

    if (!setting) {
      return {
        isActive: true,
        maxDailyAppointments: 30,
        durationBetweenAppointments: 15,
      };
    }

    return setting;
  }

  async updateSetting(
    sellerId: string,
    settings: {
      isActive: boolean;
      maxDailyAppointments: number;
      durationBetweenAppointments: number;
    },
  ) {
    return this.prisma.sellerSetting.upsert({
      where: { sellerId: sellerId },
      create: {
        sellerId: sellerId,
        ...settings,
      },
      update: settings,
    });
  }
}
