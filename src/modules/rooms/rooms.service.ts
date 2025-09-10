import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { RedisdbService } from 'src/clients/redisdb/redisdb.service';
import { TwilioService } from 'src/clients/twilio/twilio.service';
import { DatetimeService } from 'src/helpers/datetime/datetime.service';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);
  private readonly prefix = 'room:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly datetime: DatetimeService,
    private readonly redisdb: RedisdbService,
    private readonly twilio: TwilioService,
  ) {}

  private async checkRoomCreation(appointmentId: string) {
    const room = await this.redisdb.get(`${this.prefix}${appointmentId}`);
    if (room) {
      return true;
    }
    return false;
  }

  private async checkHealthAppointment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      include: {
        user: true,
        seller: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const now = this.datetime.getNowISO();

    if (appointment.startTime.toISOString() > now) {
      throw new BadRequestException('Appointment not started yet');
    }

    if (appointment.endTime.toISOString() < now) {
      throw new BadRequestException('Appointment already ended');
    }

    return appointment;
  }

  async createRoom(appointmentId: string) {
    const isRoomCreated = await this.checkRoomCreation(appointmentId);
    if (isRoomCreated) {
      this.logger.log(`Room already created for appointment ${appointmentId}`);
      console.log(`Room already created for appointment ${appointmentId}`);
      return;
    }

    const appointment = await this.checkHealthAppointment(appointmentId);

    const room = await this.redisdb.setnx(`${this.prefix}${appointmentId}`, {
      appointmentId,
      sellerId: appointment.sellerId,
      userId: appointment.userId,
      isStarted: true,
      createdAt: this.datetime.getNowISO(),
    });

    await this.twilio.createVideoRoom(`${this.prefix}${appointmentId}`, {
      uniqueName: `room:${appointmentId}`,
      maxParticipants: 2,
      // to do
      //   ttl: 3600,
    });

    this.logger.log(`Room created for appointment ${appointmentId}`);
    console.log(`Room created for appointment ${appointmentId}`);

    return room;
  }

  private async getRoomRedis(appointmentId: string) {
    const room = await this.redisdb.get(`${this.prefix}${appointmentId}`);
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return room;
  }

  /**
   * Calculate appointment duration in minutes
   * @param startTime - Appointment start time
   * @param endTime - Appointment end time
   * @returns number - Duration in minutes
   */
  calculateAppointmentDuration(startTime: Date, endTime: Date): number {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate that end time is after start time
    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // Calculate difference in milliseconds
    const diffInMs = end.getTime() - start.getTime();

    // Convert to minutes
    const diffInMinutes = Math.round(diffInMs / (1000 * 60));

    return diffInMinutes;
  }

  /**
   * Calculate appointment duration with different time units
   * @param startTime - Appointment start time
   * @param endTime - Appointment end time
   * @param unit - Time unit ('minutes', 'hours', 'seconds')
   * @returns number - Duration in specified unit
   */
  calculateAppointmentDurationInUnit(
    startTime: Date,
    endTime: Date,
    unit: 'minutes' | 'hours' | 'seconds' = 'minutes',
  ): number {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate that end time is after start time
    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // Calculate difference in milliseconds
    const diffInMs = end.getTime() - start.getTime();

    // Convert to specified unit
    switch (unit) {
      case 'seconds':
        return Math.round(diffInMs / 1000);
      case 'minutes':
        return Math.round(diffInMs / (1000 * 60));
      case 'hours':
        return Math.round(diffInMs / (1000 * 60 * 60));
      default:
        return Math.round(diffInMs / (1000 * 60));
    }
  }

  /**
   * Get appointment duration as a formatted string
   * @param startTime - Appointment start time
   * @param endTime - Appointment end time
   * @returns string - Formatted duration (e.g., "1h 30m", "45m", "2h 15m")
   */
  getFormattedAppointmentDuration(startTime: Date, endTime: Date): string {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate that end time is after start time
    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // Calculate difference in milliseconds
    const diffInMs = end.getTime() - start.getTime();

    // Convert to minutes
    const totalMinutes = Math.round(diffInMs / (1000 * 60));

    // Calculate hours and remaining minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Format the duration
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  }

  async generateVideoToken(appointmentId: string, identity: string) {
    await this.createRoom(appointmentId);

    const room = await this.getRoomRedis(appointmentId);

    const token = this.twilio.generateVideoToken(
      identity,
      `${this.prefix}${appointmentId}`,
    );

    return token;
  }

  /**
   * Generate video token without caching
   * @param appointmentId - Appointment ID
   * @param identity - User identity
   * @returns Promise<string> - Video token
   */
  async generateVideoTokenWithCache(
    appointmentId: string,
    identity: string,
  ): Promise<string> {
    await this.createRoom(appointmentId);

    // Verify room exists
    const room = await this.getRoomRedis(appointmentId);

    // Generate new token
    const token = this.twilio.generateVideoToken(
      identity,
      `${this.prefix}${appointmentId}`,
    );

    this.logger.log(
      `Generated new video token for appointment ${appointmentId} and identity ${identity}`,
    );

    return token;
  }
}
