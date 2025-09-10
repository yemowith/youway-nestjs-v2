import { BadRequestException, Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@prisma/client';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { LocationService } from 'src/modules/user/location/location.service';
import { DatetimeService } from 'src/helpers/datetime/datetime.service';
import { AppointmentSettingService } from './appointment-setting.service';
import { AvailabilityService } from 'src/modules/seller/availability/availability.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DateTime } from 'luxon';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { PackagesService } from '../packages/packages.service';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly locationService: LocationService,
    private readonly datetimeService: DatetimeService,
    private readonly appointmentSettingService: AppointmentSettingService,
    private readonly availabilityService: AvailabilityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly packagesService: PackagesService,
    private readonly avatarService: AvatarsService,
  ) {}

  public async checkSlotAvailability(params: {
    sellerId: string;
    packageId: string;
    hour: string;
    dateStr: string;
  }): Promise<boolean> {
    const { sellerId, packageId, hour, dateStr } = params;

    const slots = await this.availabilityService.getDailySlotsForSeller({
      sellerId,
      packageId,
      dateStr,
    });

    if (!slots) {
      throw new BadRequestException('No availability for this seller');
    }

    if (slots.availableSlots === 0) {
      throw new Error('No available slots');
    }

    const slot = slots.slots.find((slot) => slot.hour === hour);
    if (!slot) {
      throw new BadRequestException('No available slots');
    }

    if (!slot.isAvailable) {
      throw new BadRequestException('Selected time is not available');
    }

    return true;
  }

  /**
   * Create a new appointment
   * @param params.startTime - Start time in seller's local timezone (format: 'YYYY-MM-DDTHH:mm:ss')
   * @returns The created appointment with start/end times stored in UTC
   */
  async createAppointment(params: {
    userId: string;
    sellerId: string;
    packageId: string;
    hour: string;
    dateStr: string;
  }) {
    const { userId, sellerId, packageId, hour, dateStr } = params;

    await this.validateAppointmentEntities(userId, sellerId, packageId);

    await this.checkSlotAvailability({
      sellerId,
      packageId,
      hour,
      dateStr,
    });

    // Get seller's location and timezone
    const location = await this.locationService.getLocation(sellerId);
    if (!location) {
      throw new Error('Seller location not found');
    }

    if (!location.country?.timezone) {
      throw new Error('Seller timezone not found');
    }

    const sellerTimezone = location.country.timezone;

    const pkg = await this.prisma.package.findUnique({
      where: {
        id: packageId,
      },
    });

    if (!pkg) {
      throw new Error('Package not found');
    }

    const startTime = DateTime.fromISO(`${dateStr}T${hour}`).toString();

    // Parse the start time in seller's timezone and convert to UTC
    const startTimeUTC = this.datetimeService.parseTimeInTimezoneToUTC(
      startTime,
      sellerTimezone,
    );

    // Calculate end time in seller's timezone, then convert to UTC
    const endTimeUTC = this.datetimeService.calculateEndTimeInTimezoneToUTC(
      startTime,
      sellerTimezone,
      pkg.durationMin,
    );

    return await this.prisma.$transaction(async (prisma) => {
      const appointment = await prisma.appointment.create({
        data: {
          userId,
          sellerId,
          packageId,
          startTime: startTimeUTC,
          endTime: endTimeUTC,
          timezone: sellerTimezone,
          status: AppointmentStatus.PENDING,
        },
      });

      return appointment;
    });
  }

  /**
   * Validate that all required entities exist
   */
  private async validateAppointmentEntities(
    userId: string,
    sellerId: string,
    packageId: string,
  ): Promise<void> {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if seller exists and has a seller profile
    const seller = await this.prisma.user.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new BadRequestException('Seller not found');
    }

    const setting = await this.appointmentSettingService.getSetting(sellerId);

    if (!setting.isActive) {
      throw new BadRequestException('Seller appointment setting is not active');
    }

    // Check if package exists
    const packageDetails = await this.prisma.package.findUnique({
      where: { id: packageId },
    });
    if (!packageDetails) {
      throw new BadRequestException('Package not found');
    }

    // Check if seller offers this package
    const sellerPackage = await this.prisma.sellerPackage.findFirst({
      where: {
        sellerId: seller.id,
        packageId: packageId,
      },
    });

    if (!sellerPackage) {
      throw new BadRequestException('Seller does not offer this package');
    }
  }

  async scheduleAppointment(params: { appointmentId: string }) {
    const { appointmentId } = params;

    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (appointment.status === AppointmentStatus.SCHEDULED) {
      throw new Error('Appointment already scheduled');
    }

    const setting = await this.appointmentSettingService.getSetting(
      appointment.sellerId,
    );
    const location = await this.locationService.getLocation(
      appointment.sellerId,
    );

    if (!location) {
      throw new Error('Seller location not found');
    }

    if (!location.country?.timezone) {
      throw new Error('Seller timezone not found');
    }

    const sellerTimezone = location.country.timezone;

    const durationBetweenAppointments = setting.durationBetweenAppointments;

    const enbTimeUTC = this.datetimeService.calculateEndTimeInTimezoneToUTC(
      appointment.endTime.toISOString(),
      sellerTimezone,
      durationBetweenAppointments,
    );

    const transaction = await this.prisma.$transaction(async (prisma) => {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: AppointmentStatus.SCHEDULED },
      });

      await this.prisma.sellerUnavailability.create({
        data: {
          sellerId: appointment.sellerId,
          startTime: appointment.endTime,
          endTime: enbTimeUTC,
          reason: ' 2 Seansı arasındaki dinlenme zamanı',
          createdBy: 'SYSTEM',
        },
      });
    });

    // Emit appointment scheduled event to notify user
    const appointmentScheduledEvent = {
      appointmentId: appointment.id,
      userId: appointment.userId,
      sellerId: appointment.sellerId,
      packageId: appointment.packageId,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      timezone: sellerTimezone,
      timestamp: new Date(),
    };

    this.eventEmitter.emit('appointment.scheduled', appointmentScheduledEvent);
  }

  async getAppointments(params: { sellerId: string; date: string }) {
    const { sellerId, date } = params;
  }

  /**
   * Get appointments for a seller
   */
  async getSellerAppointments(
    sellerId: string,
    status?: string,
  ): Promise<AppointmentResponseDto[]> {
    const whereClause: any = { sellerId };
    if (status) {
      whereClause.status = status;
    }

    const appointments = await this.prisma.appointment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },

      orderBy: { startTime: 'asc' },
    });

    return await Promise.all(
      appointments.map(async (appointment) => ({
        ...appointment,
        package: await this.packagesService.getPackageById(
          appointment.packageId,
          sellerId,
        ),
      })),
    );
  }

  /**
   * Get appointments for a user
   */
  async getUserAppointments(userId: string): Promise<AppointmentResponseDto[]> {
    const appointments = await this.prisma.appointment.findMany({
      where: {
        userId,
        status: {
          in: [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.STARTED,
            AppointmentStatus.COMPLETED,
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return await Promise.all(
      appointments.map(async (appointment) => ({
        ...appointment,
        seller: {
          ...appointment.seller,
          profileImage: this.avatarService.getProfileAvatar(appointment.seller),
        },
        package: await this.packagesService.getPackageById(
          appointment.packageId,
          appointment.sellerId,
        ),
      })),
    );
  }

  /**
   * Get the last scheduled appointment for a user
   */
  async getLastScheduledUserAppointment(whereClause: {
    userId?: string;
    sellerId?: string;
  }): Promise<AppointmentResponseDto | null> {
    const now = this.datetimeService.getNowISOInDefaultTimezone();
    if (whereClause.userId && whereClause.sellerId) {
      throw new BadRequestException(
        'Both userId and sellerId cannot be provided',
      );
    }

    const appointment = await this.prisma.appointment.findFirst({
      where: {
        ...whereClause,
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.STARTED],
        },
        AND: {
          endTime: {
            gt: now,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    if (!appointment) {
      return null;
    }

    return {
      ...appointment,
      package: await this.packagesService.getPackageById(
        appointment.packageId,
        appointment.sellerId,
      ),
      user: {
        ...appointment.user,
        profileImage: this.avatarService.getProfileAvatar(appointment.user),
      },
      seller: {
        ...appointment.seller,
        profileImage: this.avatarService.getProfileAvatar(appointment.seller),
      },
    };
  }

  /**
   * Get the last appointments list for a user or seller
   */
  async getLastAppointments(params: {
    userId?: string;
    sellerId?: string;
    limit?: number;
  }): Promise<AppointmentResponseDto[]> {
    const now = this.datetimeService.getNowISOInDefaultTimezone();
    const { userId, sellerId, limit = 10 } = params;

    if (userId && sellerId) {
      throw new BadRequestException(
        'Both userId and sellerId cannot be provided',
      );
    }

    if (!userId && !sellerId) {
      throw new BadRequestException(
        'Either userId or sellerId must be provided',
      );
    }

    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (sellerId) {
      whereClause.sellerId = sellerId;
    }

    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.SCHEDULED,
        AND: {
          endTime: {
            gt: now,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return await Promise.all(
      appointments.map(async (appointment) => ({
        ...appointment,
        user: {
          ...appointment.user,
          profileImage: this.avatarService.getProfileAvatar(appointment.user),
        },
        seller: {
          ...appointment.seller,
          profileImage: this.avatarService.getProfileAvatar(appointment.seller),
        },
        package: await this.packagesService.getPackageById(
          appointment.packageId,
          appointment.sellerId,
        ),
      })),
    );
  }

  /**
   * Get appointments for a seller today
   */
  async getSellerAppointmentsToday(
    sellerId: string,
  ): Promise<AppointmentResponseDto[]> {
    // Get seller's timezone
    const location = await this.locationService.getLocation(sellerId);
    if (!location) {
      throw new BadRequestException('Seller location not found');
    }

    if (!location.country?.timezone) {
      throw new BadRequestException('Seller timezone not found');
    }

    const sellerTimezone = location.country.timezone;

    // Get today's date range in seller's timezone
    const today = DateTime.now().setZone(sellerTimezone);
    const startOfDay = today.startOf('day').toJSDate();
    const endOfDay = today.endOf('day').toJSDate();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        sellerId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: [
            AppointmentStatus.SCHEDULED,
            AppointmentStatus.STARTED,
            AppointmentStatus.COMPLETED,
          ],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    return await Promise.all(
      appointments.map(async (appointment) => ({
        ...appointment,
        user: {
          ...appointment.user,
          profileImage: this.avatarService.getProfileAvatar(appointment.user),
        },
        seller: {
          ...appointment.seller,
          profileImage: this.avatarService.getProfileAvatar(appointment.seller),
        },
        package: await this.packagesService.getPackageById(
          appointment.packageId,
          appointment.sellerId,
        ),
      })),
    );
  }
}
