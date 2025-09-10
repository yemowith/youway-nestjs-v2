import { Injectable, Logger } from '@nestjs/common';
import { Appointment, AppointmentStatus, Package, User } from '@prisma/client';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { RedisdbService } from 'src/clients/redisdb/redisdb.service';
import { DatetimeService } from 'src/helpers/datetime/datetime.service';
import { UserService } from 'src/modules/user/user.service';
import { NotifyUserService } from 'src/providers/notify-user/notify-user.service';

@Injectable()
export class ProcessAppointmentsService {
  private readonly logger = new Logger(ProcessAppointmentsService.name);
  private readonly upcomingMinutes = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisdb: RedisdbService,
    private readonly datetime: DatetimeService,
    private readonly notifyUserService: NotifyUserService,
    private readonly userService: UserService,
  ) {}

  private async notifyUpcomingAppointment(
    appointment: Appointment & { package: Package; seller: User; user: User },
  ) {
    const sellerPhone = await this.userService.getUserPhone(
      appointment.sellerId,
    );
    const userPhone = await this.userService.getUserPhone(appointment.userId);

    const sellerMessage = `Merhaba ${appointment.seller.firstName}, ${appointment.user.firstName} ${appointment.user.lastName} ile randevunuz 10 DK sonra başlayacaktir. Uygulamaya giriş yaparak katılabilirsiniz. YouWay iyi seanslar diler.`;
    const userMessage = `Merhaba Terapist ${appointment.seller.firstName} ${appointment.seller.lastName}, ${appointment.user.firstName} ${appointment.user.lastName} ile randevunuz 10 DK sonra başlayacaktir. Uygulamaya giriş yaparak katılabilirsiniz. YouWay iyi seanslar diler.`;

    try {
      if (sellerPhone) {
        await this.notifyUserService.notifyUserByPhone(
          sellerPhone,
          sellerMessage,
        );
      }
      if (userPhone) {
        await this.notifyUserService.notifyUserByPhone(userPhone, userMessage);
      }
    } catch (error) {
      console.error(error);
      this.logger.error(error);
    }
  }

  private async saveUpcomingAppointments(appointments: Appointment[]) {
    for (const appointment of appointments) {
      const getExisting = await this.redisdb.get(
        `appointment:${appointment.id}:upcoming`,
      );
      if (getExisting) {
        continue;
      }
      await this.redisdb.set(
        `appointment:${appointment.id}:upcoming`,
        appointment,
        appointment.startTime,
      );

      await this.notifyUpcomingAppointment(
        appointment as Appointment & {
          package: Package;
          seller: User;
          user: User;
        },
      );
    }
  }

  async checkStartAppointments() {
    console.log('Checking started appointments');
    const now = this.datetime.getNowISO();
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.SCHEDULED,
        startTime: {
          lte: now,
        },
      },
    });

    for (const appointment of appointments) {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: AppointmentStatus.STARTED },
      });
    }

    console.log(`Updated ${appointments.length} appointments`);
  }

  async checkUpComingAppointments() {
    const after10Minutes = this.datetime.getNowPlusMinutes(
      this.upcomingMinutes,
    );
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.SCHEDULED,
        startTime: {
          gte: after10Minutes,
        },
      },
      include: {
        seller: true,
        user: true,
        package: true,
      },
    });

    await this.saveUpcomingAppointments(appointments);
  }

  async checkEndedAppointments() {
    console.log('Checking ended appointments');
    const now = this.datetime.getNowISO();
    const appointments = await this.prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.STARTED,
        endTime: {
          lte: now,
        },
      },
    });
    for (const appointment of appointments) {
      await this.prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: AppointmentStatus.COMPLETED },
      });
    }
    console.log(`Updated ${appointments.length} appointments`);
  }

  async processAppointments() {
    console.log('Processing appointments');
    await this.checkStartAppointments();
    await this.checkUpComingAppointments();
    await this.checkEndedAppointments();
  }
}
