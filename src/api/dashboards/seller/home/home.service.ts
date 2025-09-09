import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from 'src/clients/prisma/prisma.service';
import { AppointmentService } from 'src/modules/seller/appointment/appointment.service';
import { CommissionService } from 'src/modules/accounting/commission/commission.service';
import { RatingService } from 'src/api/app/seller/rating/rating.service';
import { ChatService } from 'src/modules/chat/chat.service';
import { HomeDataDto, StatisticsDto } from './dto/home.dto';

@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appointmentService: AppointmentService,
    private readonly commissionService: CommissionService,
    private readonly ratingService: RatingService,
    private readonly chatService: ChatService,
  ) {}

  async getLatestAppointment(sellerId: string) {
    const appointment = await this.appointmentService.getLastScheduledUserAppointment(
      {
        sellerId,
      },
    );
    return appointment;
  }

  async getLastAppointments(sellerId: string) {
    const appointments = await this.appointmentService.getLastAppointments({
      sellerId,
      limit: 3,
    });
    return appointments;
  }

  async getStatistics(sellerId: string): Promise<StatisticsDto> {
    // Get current month date range
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    // Get last month date range
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Get commission statistics for current and last month
    const [
      currentMonthStats,
      lastMonthStats,
      allTimeStats,
    ] = await Promise.all([
      this.commissionService.getCommissionStatistics(
        sellerId,
        currentMonthStart,
        currentMonthEnd,
      ),
      this.commissionService.getCommissionStatistics(
        sellerId,
        lastMonthStart,
        lastMonthEnd,
      ),
      this.commissionService.getCommissionStatistics(sellerId),
    ]);

    // Calculate completed appointments
    const completedAppointments = await this.prisma.appointment.count({
      where: {
        sellerId,
        status: 'COMPLETED',
        createdAt: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
    });

    // Calculate revenue difference percentage
    const currentMonthlyRevenue = currentMonthStats.totalAmount;
    const lastMonthlyRevenue = lastMonthStats.totalAmount;
    const lastMonthlyDifferencePercentage =
      lastMonthlyRevenue > 0
        ? ((currentMonthlyRevenue - lastMonthlyRevenue) / lastMonthlyRevenue) *
          100
        : 0;

    return {
      currentMonthlyRevenue,
      lastMonthlyDifferencePercentage,
      completedAppointments,
      seansBasiOrtalama: allTimeStats.averagePerSession,
      totalCommissions: allTimeStats.totalAmount,
      totalSessions: allTimeStats.totalSessions,
      currentMonthCommissions: currentMonthStats.totalAmount,
      lastMonthCommissions: lastMonthStats.totalAmount,
    };
  }

  async getHomeData(sellerId: string): Promise<HomeDataDto> {
    const seller = await this.prisma.sellerProfile.findUnique({
      where: {
        userId: sellerId,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    const latestAppointment = await this.getLatestAppointment(sellerId);
    const statistics = await this.getStatistics(sellerId);

    const ratingStats = await this.ratingService.getSellerRatingStats(
      seller.id,
    );
    const lastMessages = await this.chatService.getLastMessages(sellerId, 10);
    const lastAppointments = await this.getLastAppointments(sellerId);
    const todayAppointments = await this.appointmentService.getSellerAppointmentsToday(
      sellerId,
    );
    return {
      latestAppointment: latestAppointment || undefined,
      statistics,
      ratingStats,
      lastMessages,
      lastAppointments,
      todayAppointments,
    };
  }
}
