import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { DatetimeService } from 'src/helpers/datetime/datetime.service';
import { AppointmentSettingService } from 'src/modules/seller/appointment/appointment-setting.service';
import { LocationService } from 'src/modules/user/location/location.service';
import { UpdateAvailabilitySettingsDto } from 'src/api/dashboards/seller/settings/seller-availability/dto/availability-settings.dto';

@Injectable()
export class SellerAvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentSettingService: AppointmentSettingService,
    private readonly locationService: LocationService,
    private readonly datetimeService: DatetimeService,
  ) {}

  async getSellerAvailability(sellerId: string) {
    return this.prisma.sellerAvailability.findMany({
      where: {
        sellerId: sellerId,
      },
    });
  }

  async getSellerUnavailability(sellerId: string) {
    try {
      const location = await this.locationService.getLocation(sellerId);

      if (!location) {
        throw new BadRequestException('Location not found for seller');
      }

      const unavailabilityPeriods = await this.prisma.sellerUnavailability.findMany(
        {
          where: {
            sellerId: sellerId,
            startTime: {
              gte: this.datetimeService.getNowISOInTimezone(
                location.country?.timezone || 'Europe/Istanbul',
              ),
            },
            createdBy: {
              not: 'SYSTEM',
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
      );

      return unavailabilityPeriods.map((period) => ({
        id: period.id,
        sellerId: period.sellerId,
        startTime: period.startTime.toISOString(),
        endTime: period.endTime.toISOString(),
        reason: period.reason || '',
        createdAt: period.createdAt.toISOString(),
        updatedAt: period.updatedAt.toISOString(),
      }));
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to retrieve unavailability periods',
      );
    }
  }

  async getAvailabilitySettings(sellerId: string) {
    try {
      const location = await this.locationService.getLocation(sellerId);

      if (!location) {
        throw new BadRequestException('Location not found for seller');
      }

      const sellerAvailability = await this.getSellerAvailability(sellerId);
      const sellerSetting = await this.appointmentSettingService.getSetting(
        sellerId,
      );

      return {
        sellerAvailability,
        sellerSetting,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve availability settings');
    }
  }

  async updateAvailabilitySettings(
    sellerId: string,
    settings: UpdateAvailabilitySettingsDto,
  ) {
    try {
      const location = await this.locationService.getLocation(sellerId);

      if (!location) {
        throw new BadRequestException('Location not found for seller');
      }

      // Validate that all 7 days are provided
      if (settings.sellerAvailability.length !== 7) {
        throw new BadRequestException(
          'All 7 days of the week must be provided',
        );
      }

      // Validate day of week values
      const dayOfWeeks = settings.sellerAvailability.map((a) => a.dayOfWeek);
      const uniqueDays = [...new Set(dayOfWeeks)];
      if (uniqueDays.length !== 7) {
        throw new BadRequestException('Each day of the week must be unique');
      }

      for (let i = 0; i < 7; i++) {
        if (!dayOfWeeks.includes(i)) {
          throw new BadRequestException(`Day of week ${i} is missing`);
        }
      }

      return await this.prisma.$transaction(async (prisma) => {
        for (const availability of settings.sellerAvailability) {
          await prisma.sellerAvailability.upsert({
            where: {
              sellerId_dayOfWeek: {
                sellerId: sellerId,
                dayOfWeek: availability.dayOfWeek,
              },
            },
            update: {
              startTime: availability.startTime,
              endTime: availability.endTime,
              isAvailable: availability.isAvailable,
            },
            create: {
              sellerId: sellerId,
              dayOfWeek: availability.dayOfWeek,
              startTime: availability.startTime,
              endTime: availability.endTime,
              isAvailable: availability.isAvailable,
            },
          });
        }

        await this.appointmentSettingService.updateSetting(
          sellerId,
          settings.sellerSettings,
        );
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update availability settings');
    }
  }

  async createSellerUnavailability(
    sellerId: string,
    unavailability: {
      startTime: string;
      endTime: string;
      reason: string;
    },
  ) {
    try {
      const location = await this.locationService.getLocation(sellerId);

      if (!location) {
        throw new BadRequestException('Location not found for seller');
      }

      // Validate that start time is before end time
      const startDate = this.datetimeService.parseTimeInTimezoneToDateTime(
        unavailability.startTime,
        location.country?.timezone || 'Europe/Istanbul',
      );
      const endDate = this.datetimeService.parseTimeInTimezoneToDateTime(
        unavailability.endTime,
        location.country?.timezone || 'Europe/Istanbul',
      );

      if (startDate >= endDate) {
        throw new BadRequestException('Start time must be before end time');
      }

      // Validate that the unavailability period is in the future
      const now = this.datetimeService.getNowISOInTimezone(
        location.country?.timezone || 'Europe/Istanbul',
      );

      if (
        startDate <=
        this.datetimeService.parseTimeInTimezoneToDateTime(
          now,
          location.country?.timezone || 'Europe/Istanbul',
        )
      ) {
        throw new BadRequestException(
          'Unavailability period must be in the future',
        );
      }

      const result = await this.prisma.sellerUnavailability.create({
        data: {
          sellerId: sellerId,
          startTime: startDate.toJSDate(),
          endTime: endDate.toJSDate(),
          reason: unavailability.reason,
          createdBy: 'USER',
        },
      });

      return {
        id: result.id,
        sellerId: result.sellerId,
        startTime: result.startTime.toISOString(),
        endTime: result.endTime.toISOString(),
        reason: result.reason || '',
        createdAt: result.createdAt.toISOString(),
        updatedAt: result.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create unavailability period');
    }
  }

  async deleteSellerUnavailability(sellerId: string, unavailabilityId: string) {
    try {
      // Check if the unavailability belongs to the seller
      const unavailability = await this.prisma.sellerUnavailability.findFirst({
        where: {
          id: unavailabilityId,
          sellerId: sellerId,
        },
      });

      if (!unavailability) {
        throw new BadRequestException(
          'Unavailability period not found or does not belong to seller',
        );
      }

      return this.prisma.sellerUnavailability.delete({
        where: {
          id: unavailabilityId,
        },
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete unavailability period');
    }
  }
}
