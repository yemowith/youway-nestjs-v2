import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationDetails } from './notifications.types';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private gateway: NotificationsGateway,
  ) {}

  async createNotification(
    userId: string,
    message: string,
    type: string = 'INFO',
    details?: NotificationDetails,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        message,
        type,
        details: details === undefined ? undefined : details,
      },
    });

    // this.gateway.sendNotification(userId, notification);
    return notification;
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({
        where: { userId },
      }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadNotifications(userId: string) {
    return await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { isRead: true },
    });

    if (result.count === 0) {
      throw new NotFoundException('Notification not found');
    }

    return await this.getUnreadCount(userId);
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
    return await this.getUnreadCount(userId);
  }

  async getUnreadCount(userId: string) {
    return await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  async removeNotification(
    notificationId: string,
    userId: string,
  ): Promise<number> {
    const result = await this.prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });

    const count = await this.getUnreadCount(userId);
    return count;
  }

  async removeAllNotifications(userId: string) {
    await this.prisma.notification.deleteMany({
      where: { userId },
    });
    return 0;
  }
}
