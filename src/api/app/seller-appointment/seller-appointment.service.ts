import { Injectable, BadRequestException } from '@nestjs/common';
import { AvailabilityService } from 'src/modules/seller/availability/availability.service';
import { DailySlotsResponseDto } from './dto';

@Injectable()
export class SellerAppointmentService {
  constructor(private readonly availabilityService: AvailabilityService) {}

  async getDailySlotsForSeller(params: {
    sellerId: string;
    packageId: string;
    dateStr: string;
    slotMinutes?: number;
  }): Promise<DailySlotsResponseDto | null> {
    const { sellerId, packageId, dateStr, slotMinutes = 15 } = params;

    // Validate required parameters
    if (!sellerId) {
      throw new BadRequestException('Seller ID is required');
    }

    if (!packageId) {
      throw new BadRequestException('Package ID is required');
    }

    if (!dateStr) {
      throw new BadRequestException('Date is required');
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    // Validate slotMinutes
    if (slotMinutes && (slotMinutes <= 0 || slotMinutes > 1440)) {
      throw new BadRequestException('slotMinutes must be between 1 and 1440');
    }

    try {
      const slots = await this.availabilityService.getDailySlotsForSeller({
        sellerId,
        packageId,
        dateStr,
        slotMinutes,
      });

      if (!slots) {
        return {
          totalSlots: 0,
          availableSlots: 0,
          bookedSlots: 0,
          outsideHoursSlots: 0,
          existingAppointments: 0,
          unavailabilities: 0,
          slots: [],
        };
      }

      return slots;
    } catch (error) {
      throw new BadRequestException(
        `Failed to get daily slots: ${error.message}`,
      );
    }
  }
}
