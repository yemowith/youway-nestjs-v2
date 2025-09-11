import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { DateTime } from 'luxon';

import {
  Appointment,
  AppointmentStatus,
  Package,
  SellerAvailability,
  SellerUnavailability,
} from '@prisma/client';
import { LocationService } from 'src/modules/user/location/location.service';
import { DatetimeService } from 'src/helpers/datetime/datetime.service';
import * as moment from 'moment';

type Slot = {
  dayDate: string; // YYYY-MM-DD
  hour: string; // HH:MM
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  isOutsideHours: boolean;
  tz?: string;
};

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locationsService: LocationService,
    private readonly datetimeService: DatetimeService,
  ) {}

  async getAppointments(params: {
    sellerId: string;
    startTime: string;
    endTime: string;
  }): Promise<Appointment[]> {
    const { sellerId, startTime, endTime } = params;

    const appointments = await this.prisma.appointment.findMany({
      where: {
        sellerId,
        startTime: {
          gte: startTime,
        },
        endTime: {
          lte: endTime,
        },
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.STARTED],
        },
      },
    });

    return appointments;
  }

  async getUnavailabilities(params: {
    sellerId: string;
    startTime: string;
    endTime: string;
  }): Promise<SellerUnavailability[]> {
    const { sellerId, startTime, endTime } = params;

    const unavailabilities = await this.prisma.sellerUnavailability.findMany({
      where: {
        sellerId: sellerId,
        startTime: {
          gte: startTime,
        },
        endTime: {
          lte: endTime,
        },
      },
    });

    return unavailabilities;
  }

  public async getDefaultAvailabilityForSeller(params: {
    sellerId: string;
    dayOfWeek0Sun: number;
  }): Promise<any> {
    const { sellerId, dayOfWeek0Sun } = params;

    return await this.prisma.sellerAvailability.findUnique({
      where: {
        sellerId_dayOfWeek: { sellerId: sellerId, dayOfWeek: dayOfWeek0Sun },
      },
    });
  }

  private async initializeSlotsForSeller(params: {
    sellerId: string;
    packageId: string;
    dateStr: string; // 'YYYY-MM-DD' in the seller's local tz
    slotMinutes?: number; // default 15
  }): Promise<{
    tz: string;
    pkg: Package;
    dayOfWeek: number;
    dayStartLocal: DateTime;
    sellerAvailability: SellerAvailability;
  }> {
    const { sellerId, packageId, dateStr, slotMinutes = 15 } = params;

    // Get seller location and validate timezone
    const location = await this.locationsService.getLocation(sellerId);
    if (!location) {
      throw new BadRequestException('Location not found for seller');
    }

    if (!location.country?.timezone) {
      throw new BadRequestException('Seller timezone not found');
    }

    const tz = location.country.timezone;

    const pkg = await this.prisma.package.findUnique({
      where: { id: packageId, isActive: true },
    });
    if (!pkg) {
      throw new BadRequestException('Package not found');
    }

    // Validate slotMinutes
    if (slotMinutes <= 0 || slotMinutes > 1440) {
      throw new BadRequestException('slotMinutes must be between 1 and 1440');
    }

    // Parse the date string
    const dayStartLocal = DateTime.fromISO(`${dateStr}T00:00:00`);
    if (!dayStartLocal.isValid) {
      throw new BadRequestException('Invalid dateStr');
    }

    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    // Luxon weekday: 1=Monday, 7=Sunday, we need 0=Sunday, 1=Monday
    const dayOfWeek = dayStartLocal.weekday === 7 ? 0 : dayStartLocal.weekday;

    const sellerAvailability = await this.getDefaultAvailabilityForSeller({
      sellerId,
      dayOfWeek0Sun: dayOfWeek,
    });

    return { tz, pkg, dayOfWeek, dayStartLocal, sellerAvailability };
  }

  private async generateSlots(params: {
    sellerAvailability: SellerAvailability;
    dayStartLocal: DateTime;
    slotMinutes: number;
    tz: string;
  }): Promise<Slot[]> {
    const { sellerAvailability, dayStartLocal, slotMinutes, tz } = params;
    const slots: Slot[] = [];

    const { startTime, endTime } = sellerAvailability;

    // Handle null values
    if (!startTime || !endTime) return [];

    const generateTimeParts = (
      time: string,
    ): { hour: number; minute: number } => {
      const timeParts = time.split(':');
      if (timeParts.length < 2) return { hour: 0, minute: 0 };
      return {
        hour: parseInt(timeParts[0], 10),
        minute: parseInt(timeParts[1], 10),
      };
    };

    const { hour: startHour, minute: startMinute } = generateTimeParts(
      startTime,
    );
    const { hour: endHour, minute: endMinute } = generateTimeParts(endTime);

    const availabilityStart = dayStartLocal.set({
      hour: startHour,
      minute: startMinute,
      second: 0,
      millisecond: 0,
    });

    const availabilityEnd = dayStartLocal.set({
      hour: endHour,
      minute: endMinute,
      second: 0,
      millisecond: 0,
    });

    for (
      let time = availabilityStart.toMillis();
      time <= availabilityEnd.toMillis();
      time += slotMinutes * 60 * 1000
    ) {
      const slotStart = DateTime.fromMillis(time).toFormat('HH:mm:ss');
      const slotEnd = DateTime.fromMillis(
        time + slotMinutes * 60 * 999,
      ).toFormat('HH:mm:ss');
      slots.push({
        dayDate: dayStartLocal.toFormat('yyyy-MM-dd'),
        hour: slotStart,
        startTime: this.datetimeService.parseTimeInTimezoneToUTC(
          `${dayStartLocal.toFormat('yyyy-MM-dd')}T${slotStart}`,
          tz,
        ),
        endTime: this.datetimeService.parseTimeInTimezoneToUTC(
          `${dayStartLocal.toFormat('yyyy-MM-dd')}T${slotEnd}`,
          tz,
        ),
        isAvailable: true,
        isBooked: false,
        isOutsideHours: false,
        tz,
      });
    }

    const currentTime = this.datetimeService.getNowISO();
    console.log('currentTime', currentTime);

    return slots.filter((slot) => {
      return slot.startTime >= currentTime;
    });
  }

  private checkDurationAvailability(params: {
    pkg: Package;
    selectedSlot: Slot;
    slots: Slot[];
    slotMinutes: number;
  }): boolean {
    const { pkg, slots, selectedSlot, slotMinutes } = params;
    const duration = pkg.durationMin;

    // If package duration equals slot duration, it fits in one slot
    if (duration === slotMinutes) return true;

    // Calculate how many slots we need
    const slotsNeeded = Math.ceil(duration / slotMinutes);

    // Find the index of the selected slot
    const selectedSlotIndex = slots.findIndex(
      (slot) =>
        slot.dayDate === selectedSlot.dayDate &&
        slot.hour === selectedSlot.hour,
    );

    if (selectedSlotIndex === -1) {
      return false;
    }

    // Check if we have enough slots remaining from the selected slot
    if (selectedSlotIndex + slotsNeeded > slots.length) {
      return false;
    }

    // Check if we have enough consecutive slots starting from the selected slot
    for (let i = 0; i < slotsNeeded; i++) {
      const slotIndex = selectedSlotIndex + i;
      const slot = slots[slotIndex];

      // Check if the slot is available and not booked or outside hours
      if (!slot.isAvailable || slot.isBooked || slot.isOutsideHours) {
        return false;
      }

      // Check if this is the same day (for multi-day packages)
      if (slot.dayDate !== selectedSlot.dayDate) {
        return false;
      }
    }

    return true;
  }

  async getDailySlotsForSeller(params: {
    sellerId: string;
    packageId: string;
    dateStr: string;
    slotMinutes?: number; // default 15
  }): Promise<{
    totalSlots: number;
    availableSlots: number;
    bookedSlots: number;
    outsideHoursSlots: number;
    existingAppointments: number;
    unavailabilities: number;
    slots: Slot[];
  } | null> {
    const { sellerId, dateStr, slotMinutes = 15, packageId } = params;

    const {
      tz,
      pkg,
      dayOfWeek,
      dayStartLocal,
      sellerAvailability,
    } = await this.initializeSlotsForSeller({
      sellerId,
      packageId,
      dateStr,
      slotMinutes,
    });

    if (!sellerAvailability || !sellerAvailability.isAvailable) {
      return null;
    }

    const slots = await this.generateSlots({
      sellerAvailability,
      dayStartLocal,
      slotMinutes,
      tz,
    });

    if (slots.length === 0) {
      return null;
    }

    const existingAppointments = await this.getAppointments({
      sellerId,
      startTime: slots[0].startTime,
      endTime: slots[slots.length - 1].endTime,
    });

    for (const slot of slots) {
      const hasConflict = existingAppointments.some((appointment) => {
        return (
          slot.startTime >= appointment.startTime.toISOString() &&
          slot.endTime <= appointment.endTime.toISOString()
        );
      });
      slot.isBooked = hasConflict;
    }

    const unavailabilities = await this.getUnavailabilities({
      sellerId,
      startTime: slots[0].startTime,
      endTime: slots[slots.length - 1].endTime,
    });

    for (const slot of slots) {
      const hasConflict = unavailabilities.some((unavailability) => {
        return (
          slot.startTime >= unavailability.startTime.toISOString() &&
          slot.endTime <= unavailability.endTime.toISOString()
        );
      });
      slot.isOutsideHours = hasConflict;
    }

    // First, set basic availability based on conflicts
    for (const slot of slots) {
      slot.isAvailable = !slot.isBooked && !slot.isOutsideHours;
    }

    // Then check duration availability for each slot
    for (const slot of slots) {
      if (slot.isAvailable) {
        // Only check duration if the slot is otherwise available
        const isAvailable = this.checkDurationAvailability({
          pkg,
          selectedSlot: slot,
          slots,
          slotMinutes,
        });
        slot.isAvailable = isAvailable;
        slot.isOutsideHours = !isAvailable;
      }
    }

    const results = {
      totalSlots: slots.length,
      availableSlots: slots.filter((slot) => slot.isAvailable).length,
      bookedSlots: slots.filter((slot) => slot.isBooked).length,
      outsideHoursSlots: slots.filter((slot) => slot.isOutsideHours).length,
      existingAppointments: existingAppointments.length,
      unavailabilities: unavailabilities.length,
      slots,
    };

    return results;
  }
}
