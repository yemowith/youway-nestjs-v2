import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  AppointmentScheduledEvent,
  APPOINTMENT_EVENTS,
} from './appointment.events';
import { NotifyUserService } from 'src/providers/notify-user/notify-user.service';
import { UserService } from 'src/modules/user/user.service';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class AppointmentEventsListener {
  private readonly logger = new Logger(AppointmentEventsListener.name);

  constructor(
    private readonly notifyUserService: NotifyUserService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent(APPOINTMENT_EVENTS.SCHEDULED)
  async handleAppointmentScheduledEvent(payload: AppointmentScheduledEvent) {
    this.logger.log(
      `Appointment scheduled: ${payload.appointmentId} for user ${payload.userId}`,
    );

    try {
      // Get user details and package information
      const [user, packageInfo, seller] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            identities: true,
          },
        }),
        this.prisma.package.findUnique({
          where: { id: payload.packageId },
        }),
        this.prisma.user.findUnique({
          where: { id: payload.sellerId },
          include: {
            identities: true,
          },
        }),
      ]);

      if (!user || !packageInfo || !seller) {
        this.logger.error('Failed to get user, package, or seller information');
        return;
      }

      // Format appointment time in user's timezone (assuming same as seller for now)
      const startTimeLocal = new Date(payload.startTime).toLocaleString(
        'tr-TR',
        {
          timeZone: payload.timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      );

      const endTimeLocal = new Date(payload.endTime).toLocaleString('tr-TR', {
        timeZone: payload.timezone,
        hour: '2-digit',
        minute: '2-digit',
      });

      // Send notification to USER
      await this.notifyUserService.notifyUser(
        user.identities,
        'Randevunuz Başarıyla Planlandı',
        {
          mail: `
          <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">

            
            <p>Merhaba ${user.firstName} ${user.lastName},</p>
            
            <p>Randevunuz başarıyla planlandı. Detaylar aşağıdadır:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #007bff; margin-top: 0;">Randevu Detayları</h3>
              <p><strong>Paket:</strong> ${packageInfo.name}</p>
              <p><strong>Süre:</strong> ${packageInfo.durationMin} dakika</p>
              <p><strong>Tarih:</strong> ${startTimeLocal}</p>
              <p><strong>Bitiş:</strong> ${endTimeLocal}</p>
              <p><strong>Danışman:</strong> ${seller.firstName} ${seller.lastName}</p>
            </div>
            
            <p><strong>Önemli Notlar:</strong></p>
            <ul>
              <li>Randevunuzdan 15 dakika önce hazır olun</li>
              <li>İnternet bağlantınızın stabil olduğundan emin olun</li>
              <li>Randevu saatinde giriş yapın</li>
            </ul>
            
            <p>Herhangi bir sorunuz olursa bizimle iletişime geçebilirsiniz.</p>
            
            <p>Teşekkürler,<br>YouWay Ekibi</p>
          </div>
          `,
          sms: `
          Randevunuz planlandı: ${packageInfo.name} - ${startTimeLocal} - ${seller.firstName} ${seller.lastName}
          `,
        },
      );

      // Send notification to SELLER
      await this.notifyUserService.notifyUser(
        seller.identities,
        'Yeni Randevu Planlandı',
        {
          mail: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Yeni Randevu Planlandı</h2>
            
            <p>Merhaba ${seller.firstName} ${seller.lastName},</p>
            
            <p>Yeni bir randevu planlandı. Detaylar aşağıdadır:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Randevu Detayları</h3>
              <p><strong>Paket:</strong> ${packageInfo.name}</p>
              <p><strong>Süre:</strong> ${packageInfo.durationMin} dakika</p>
              <p><strong>Tarih:</strong> ${startTimeLocal}</p>
              <p><strong>Bitiş:</strong> ${endTimeLocal}</p>
              <p><strong>Müşteri:</strong> ${user.firstName} ${user.lastName}</p>
            </div>
            
            <p><strong>Hazırlık Notları:</strong></p>
            <ul>
              <li>Randevudan 10 dakika önce hazır olun</li>
              <li>Gerekli materyalleri hazırlayın</li>
              <li>Müşteri ile iletişime geçin</li>
            </ul>
            
            <p>Randevu detaylarını kontrol etmek için panelinizi ziyaret edin.</p>
            
            <p>Teşekkürler,<br>YouWay Ekibi</p>
          </div>
          `,
          sms: `
          Yeni randevu: ${packageInfo.name} - ${startTimeLocal} - ${user.firstName} ${user.lastName}
          `,
        },
      );

      this.logger.log(
        `Appointment notifications sent successfully to user ${payload.userId} and seller ${payload.sellerId}.`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send appointment notification: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent(APPOINTMENT_EVENTS.CANCELLED)
  async handleAppointmentCancelledEvent(payload: AppointmentScheduledEvent) {
    this.logger.log(
      `Appointment cancelled: ${payload.appointmentId} for user ${payload.userId}`,
    );

    try {
      // Get user details and package information
      const [user, packageInfo, seller] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            identities: true,
          },
        }),
        this.prisma.package.findUnique({
          where: { id: payload.packageId },
        }),
        this.prisma.user.findUnique({
          where: { id: payload.sellerId },
          include: {
            identities: true,
          },
        }),
      ]);

      if (!user || !packageInfo || !seller) {
        this.logger.error('Failed to get user, package, or seller information');
        return;
      }

      // Format appointment time in user's timezone
      const startTimeLocal = new Date(payload.startTime).toLocaleString(
        'tr-TR',
        {
          timeZone: payload.timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      );

      // Send cancellation notification to USER
      await this.notifyUserService.notifyUser(
        user.identities,
        'Randevunuz İptal Edildi',
        {
          mail: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Randevunuz İptal Edildi</h2>
            
            <p>Merhaba ${user.firstName} ${user.lastName},</p>
            
            <p>Aşağıdaki randevunuz iptal edilmiştir:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc3545; margin-top: 0;">İptal Edilen Randevu</h3>
              <p><strong>Paket:</strong> ${packageInfo.name}</p>
              <p><strong>Süre:</strong> ${packageInfo.durationMin} dakika</p>
              <p><strong>Tarih:</strong> ${startTimeLocal}</p>
              <p><strong>Danışman:</strong> ${seller.firstName} ${seller.lastName}</p>
            </div>
            
            <p>Yeni bir randevu planlamak için bizimle iletişime geçebilirsiniz.</p>
            
            <p>Teşekkürler,<br>YouWay Ekibi</p>
          </div>
          `,
          sms: `
          Randevunuz iptal edildi: ${packageInfo.name} - ${startTimeLocal} - ${seller.firstName} ${seller.lastName}
          `,
        },
      );

      // Send cancellation notification to SELLER
      await this.notifyUserService.notifyUser(
        seller.identities,
        'Randevu İptal Edildi',
        {
          mail: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc3545;">Randevu İptal Edildi</h2>
            
            <p>Merhaba ${seller.firstName} ${seller.lastName},</p>
            
            <p>Aşağıdaki randevu iptal edilmiştir:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #dc3545; margin-top: 0;">İptal Edilen Randevu</h3>
              <p><strong>Paket:</strong> ${packageInfo.name}</p>
              <p><strong>Süre:</strong> ${packageInfo.durationMin} dakika</p>
              <p><strong>Tarih:</strong> ${startTimeLocal}</p>
              <p><strong>Müşteri:</strong> ${user.firstName} ${user.lastName}</p>
            </div>
            
            <p>Randevu detaylarını kontrol etmek için panelinizi ziyaret edin.</p>
            
            <p>Teşekkürler,<br>YouWay Ekibi</p>
          </div>
          `,
          sms: `
          Randevu iptal edildi: ${packageInfo.name} - ${startTimeLocal} - ${user.firstName} ${user.lastName}
          `,
        },
      );

      this.logger.log(
        `Appointment cancellation notifications sent successfully to user ${payload.userId} and seller ${payload.sellerId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send appointment cancellation notification: ${error.message}`,
        error.stack,
      );
    }
  }

  @OnEvent(APPOINTMENT_EVENTS.COMPLETED)
  async handleAppointmentCompletedEvent(payload: AppointmentScheduledEvent) {
    this.logger.log(
      `Appointment completed: ${payload.appointmentId} for user ${payload.userId}`,
    );

    try {
      // Get user details and package information
      const [user, packageInfo, seller] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            identities: true,
          },
        }),
        this.prisma.package.findUnique({
          where: { id: payload.packageId },
        }),
        this.prisma.user.findUnique({
          where: { id: payload.sellerId },
          include: {
            identities: true,
          },
        }),
      ]);

      if (!user || !packageInfo || !seller) {
        this.logger.error('Failed to get user, package, or seller information');
        return;
      }

      // Format appointment time in user's timezone
      const startTimeLocal = new Date(payload.startTime).toLocaleString(
        'tr-TR',
        {
          timeZone: payload.timezone,
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      );

      // Send completion notification to USER
      await this.notifyUserService.notifyUser(
        user.identities,
        'Randevunuz Tamamlandı',
        {
          mail: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Randevunuz Tamamlandı</h2>
            
            <p>Merhaba ${user.firstName} ${user.lastName},</p>
            
            <p>Aşağıdaki randevunuz başarıyla tamamlanmıştır:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Tamamlanan Randevu</h3>
              <p><strong>Paket:</strong> ${packageInfo.name}</p>
              <p><strong>Süre:</strong> ${packageInfo.durationMin} dakika</p>
              <p><strong>Tarih:</strong> ${startTimeLocal}</p>
              <p><strong>Danışman:</strong> ${seller.firstName} ${seller.lastName}</p>
            </div>
            
            <p>Randevunuzdan memnun kaldıysanız, danışmanınıza değerlendirme yapabilirsiniz.</p>
            
            <p>Yeni randevular için bizimle iletişime geçebilirsiniz.</p>
            
            <p>Teşekkürler,<br>YouWay Ekibi</p>
          </div>
          `,
          sms: `
          Randevunuz tamamlandı: ${packageInfo.name} - ${startTimeLocal} - ${seller.firstName} ${seller.lastName}
          `,
        },
      );

      // Send completion notification to SELLER
      await this.notifyUserService.notifyUser(
        seller.identities,
        'Randevu Tamamlandı',
        {
          mail: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #28a745;">Randevu Tamamlandı</h2>
            
            <p>Merhaba ${seller.firstName} ${seller.lastName},</p>
            
            <p>Aşağıdaki randevu başarıyla tamamlanmıştır:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #28a745; margin-top: 0;">Tamamlanan Randevu</h3>
              <p><strong>Paket:</strong> ${packageInfo.name}</p>
              <p><strong>Süre:</strong> ${packageInfo.durationMin} dakika</p>
              <p><strong>Tarih:</strong> ${startTimeLocal}</p>
              <p><strong>Müşteri:</strong> ${user.firstName} ${user.lastName}</p>
            </div>
            
            <p>Randevu detaylarını kontrol etmek için panelinizi ziyaret edin.</p>
            
            <p>Teşekkürler,<br>YouWay Ekibi</p>
          </div>
          `,
          sms: `
          Randevu tamamlandı: ${packageInfo.name} - ${startTimeLocal} - ${user.firstName} ${user.lastName}
          `,
        },
      );

      this.logger.log(
        `Appointment completion notifications sent successfully to user ${payload.userId} and seller ${payload.sellerId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send appointment completion notification: ${error.message}`,
        error.stack,
      );
    }
  }
}
