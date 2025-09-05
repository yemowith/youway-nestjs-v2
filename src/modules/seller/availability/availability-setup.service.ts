import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class AvailabilitySetupService {
  constructor(private readonly prisma: PrismaService) {}

  async setupSellerAvailability(sellerId: string) {
    const defaultAvailabilities = await this.prisma.defaultAvailability.findMany();
    for (const availability of defaultAvailabilities) {
      await this.prisma.sellerAvailability.upsert({
        where: {
          sellerId_dayOfWeek: {
            sellerId,
            dayOfWeek: availability.dayOfWeek,
          },
        },
        update: {},
        create: {
          sellerId,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
          endTime: availability.endTime,
          isAvailable: availability.isAvailable,
        },
      });
    }
  }
}
