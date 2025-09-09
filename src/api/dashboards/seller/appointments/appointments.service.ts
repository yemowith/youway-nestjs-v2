import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { AppointmentStatus } from '@prisma/client';
import { AppointmentResponseDto } from 'src/modules/seller/appointment/dto/appointment-response.dto';
import { PackagesService } from 'src/modules/seller/packages/packages.service';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';

export interface AppointmentFilters {
  status?: AppointmentStatus;
  startDate?: string;
  endDate?: string;
  userId?: string;
  packageId?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: 'startTime' | 'createdAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAppointmentsResponse {
  appointments: AppointmentResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly packagesService: PackagesService,
    private readonly avatarService: AvatarsService,
  ) {}

  async getSellerAppointments(
    sellerId: string,
    filters: AppointmentFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedAppointmentsResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'startTime',
      sortOrder = 'desc',
    } = pagination;

    const { status, startDate, endDate, userId, packageId } = filters;

    // Validate pagination parameters
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }

    // Build where clause
    const whereClause: any = {
      sellerId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (packageId) {
      whereClause.packageId = packageId;
    }

    if (startDate || endDate) {
      whereClause.startTime = {};
      if (startDate) {
        whereClause.startTime.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.startTime.lte = new Date(endDate);
      }
    }

    // Calculate offset
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.prisma.appointment.count({
      where: whereClause,
    });

    // Get appointments with pagination
    const appointments = await this.prisma.appointment.findMany({
      where: whereClause,
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
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: limit,
    });

    // Process appointments to include package details and avatar URLs
    const processedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const packageDetails = await this.packagesService.getPackageById(
          appointment.packageId,
          appointment.sellerId,
        );

        return {
          ...appointment,
          user: appointment.user
            ? {
                ...appointment.user,
                profileImage: this.avatarService.getProfileAvatar(
                  appointment.user,
                ),
              }
            : undefined,
          seller: appointment.seller
            ? {
                ...appointment.seller,
                profileImage: this.avatarService.getProfileAvatar(
                  appointment.seller,
                ),
              }
            : undefined,
          package: packageDetails,
        } as AppointmentResponseDto;
      }),
    );

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      appointments: processedAppointments,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async getAppointmentById(
    appointmentId: string,
    sellerId: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        sellerId,
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
    });

    if (!appointment) {
      throw new BadRequestException('Appointment not found');
    }

    const packageDetails = await this.packagesService.getPackageById(
      appointment.packageId,
      appointment.sellerId,
    );

    return {
      ...appointment,
      user: appointment.user
        ? {
            ...appointment.user,
            profileImage: this.avatarService.getProfileAvatar(appointment.user),
          }
        : undefined,
      seller: appointment.seller
        ? {
            ...appointment.seller,
            profileImage: this.avatarService.getProfileAvatar(
              appointment.seller,
            ),
          }
        : undefined,
      package: packageDetails,
    } as AppointmentResponseDto;
  }

  async getAppointmentStats(
    sellerId: string,
  ): Promise<{
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    pending: number;
  }> {
    const [total, scheduled, completed, cancelled, pending] = await Promise.all(
      [
        this.prisma.appointment.count({
          where: { sellerId },
        }),
        this.prisma.appointment.count({
          where: { sellerId, status: AppointmentStatus.SCHEDULED },
        }),
        this.prisma.appointment.count({
          where: { sellerId, status: AppointmentStatus.COMPLETED },
        }),
        this.prisma.appointment.count({
          where: { sellerId, status: AppointmentStatus.CANCELLED },
        }),
        this.prisma.appointment.count({
          where: { sellerId, status: AppointmentStatus.PENDING },
        }),
      ],
    );

    return {
      total,
      scheduled,
      completed,
      cancelled,
      pending,
    };
  }
}
