import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NetGSMSender } from './netgsm';

@Injectable()
export class SmsService {
  private readonly netGsmSender: NetGSMSender;
  private readonly smsHeader: string;

  constructor(private readonly configService: ConfigService) {
    this.netGsmSender = new NetGSMSender({
      username: this.configService.getOrThrow<string>('sms.netgsm.username'),
      password: this.configService.getOrThrow<string>('sms.netgsm.password'),
    });
    this.smsHeader = this.configService.getOrThrow<string>('sms.netgsm.header');
  }

  async sendOtp(phone: string, otp: string) {
    const message = `Your OTP code is: ${otp}`;
    const messages = [NetGSMSender.createMessage(message, phone)];
    const request = NetGSMSender.createRequest(this.smsHeader, messages);

    console.log(`OTP sent to phone`);

    await this.netGsmSender.sendSMS(request);
  }

  async sendNotification(phone: string, message: string) {
    const messages = [NetGSMSender.createMessage(message, phone)];
    const request = NetGSMSender.createRequest(this.smsHeader, messages);
    await this.netGsmSender.sendSMS(request);
  }
}
