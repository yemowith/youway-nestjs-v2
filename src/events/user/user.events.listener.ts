import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  NewUserRegisteredEvent,
  USER_EVENTS,
  PasswordSetEvent,
} from './user.events';
import { NewSellerCreatedEvent, SELLER_EVENTS } from './user.events';
import { NotifyUserService } from 'src/providers/notify-user/notify-user.service';

@Injectable()
export class UserEventsListener {
  private readonly logger = new Logger(UserEventsListener.name);

  constructor(private readonly notifyUserService: NotifyUserService) {}

  @OnEvent(USER_EVENTS.REGISTERED)
  async handleUserRegisteredEvent(payload: NewUserRegisteredEvent) {
    this.logger.log(
      `New user registered: ${payload.email} (${payload.userId})`,
    );
  }

  @OnEvent(SELLER_EVENTS.CREATED)
  async handleSellerCreatedEvent(payload: NewSellerCreatedEvent) {
    this.logger.log(
      `New seller created: ${payload.firstName} ${payload.lastName} (${payload.userId})`,
    );

    await this.notifyUserService.notifyUser(
      payload.identities,
      'YouWay Ailesine Hoş Geldiniz',
      {
        mail: `
        <p>Merhaba ${payload.firstName} ${payload.lastName},</p>
        <p>YouWay Ailemize Hoş Geldiniz.</p>
        <p>Giriş şifreniz : ${payload.password}</p>
        <p>Lütfen şifrenizi değiştiriniz.</p>
        <p>Giriş yapmak için <a href="${process.env.APP_URL}/auth/login">buraya</a> tıklayınız.</p>
        `,
        sms: `
        Merhaba ${payload.firstName} ${payload.lastName},
        YouWay Ailemize Hoş Geldiniz.
        Giriş şifreniz : ${payload.password}
        `,
      },
    );
    // Add logic for new seller creation (e.g., send welcome email, notify admin, etc.)
  }

  @OnEvent(USER_EVENTS.PASSWORD_SET)
  async handlePasswordSetEvent(payload: PasswordSetEvent) {
    this.logger.log(
      `Password set for user: ${payload.firstName} ${payload.lastName} (${payload.userId})`,
    );

    await this.notifyUserService.notifyUser(
      payload.identities,
      'Şifreniz Güncellendi',
      {
        mail: `
        <p>Merhaba ${payload.firstName} ${payload.lastName},</p>
        <p>Şifreniz başarıyla güncellendi.</p>
        <p>Yeni şifreniz: <b>${payload.password}</b></p>
        <p>Giriş yapmak için <a href="${
          process.env.APP_URL || '#'
        }">buraya</a> tıklayınız.</p>
        `,
        sms: `
        Merhaba ${payload.firstName} ${payload.lastName},
        Şifreniz başarıyla güncellendi. Yeni şifreniz: ${payload.password}
        `,
      },
    );
  }
}
