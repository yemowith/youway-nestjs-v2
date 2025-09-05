import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.getOrThrow<string>('mail.host'),
      port: this.configService.getOrThrow<number>('mail.port'),
      secure: this.configService.getOrThrow<number>('mail.port') === 465, // true for 465, false for other ports
      auth: {
        user: this.configService.getOrThrow<string>('mail.user'),
        pass: this.configService.getOrThrow<string>('mail.password'),
      },
    });
  }

  async sendOtp(to: string, otp: string) {
    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('mail.from'),
      to,
      subject: 'Your OTP Code',
      text: `Your OTP code is: ${otp}`,
      html: `<b>Your OTP code is: ${otp}</b>`,
    });
  }

  getStableMailTemplate(subject: string, message: string): string {
    const logo = this.configService.get<string>('mail.logo');
    let logoHtml = '';
    if (logo) {
      if (logo.trim().startsWith('<svg')) {
        logoHtml = `<div style="display: flex; justify-content: center; margin-bottom: 16px;">${logo}</div>`;
      } else {
        logoHtml = `<img src="${logo}" alt="Logo" style="height: 26px; width: auto; display: block; margin: 0 auto 16px auto;" />`;
      }
    }
    return `
      <div style="font-family: Arial, sans-serif; background: #f4f6fb; padding: 0; margin: 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f4f6fb; padding: 0; margin: 0;">
          <tr>
            <td align="center" style="padding: 40px 0 24px 0;">
              ${logoHtml}
            </td>
          </tr>
          <tr>
            <td align="center">
              <table width="480" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); padding: 0;">
                <tr>
                  <td style="padding: 32px 32px 16px 32px; text-align: left;">
                    <h2 style="color: #2d3748; margin: 0 0 16px 0; font-size: 24px; font-weight: 700;">${subject}</h2>
                    <div style="color: #444; font-size: 16px; line-height: 1.7;">${message}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 0 32px 32px 32px; text-align: left;">
                    <div style="margin-top: 32px; color: #888; font-size: 12px;">Bu e-posta otomatik olarak oluşturulmuştur. Lütfen yanıtlamayınız.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 32px 0 0 0; color: #b0b0b0; font-size: 12px; margin-bottom: 32px;">
              © ${new Date().getFullYear()} ${this.configService.getOrThrow<
      string
    >('app.name')}. Tüm hakları saklıdır.
            </td>
          </tr>
        </table>
      </div>
    `;
  }

  async sendNotification(to: string, subject: string, message: string) {
    await this.transporter.sendMail({
      from: this.configService.getOrThrow<string>('mail.from'),
      to,
      subject,
      text: message,
      html: this.getStableMailTemplate(subject, message),
    });
  }
}
