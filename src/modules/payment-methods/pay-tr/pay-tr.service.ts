import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import axios, { AxiosRequestConfig } from 'axios';
import { PrismaService } from 'src/clients/prisma/prisma.service';
import { OrderService } from 'src/api/app/order/order.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayTrService {
  private merchantId: string;
  private merchantKey: string;
  private merchantSalt: string;
  private testMode: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
  ) {
    this.merchantId = this.configService.get('paytr.merchantId')!;
    this.merchantKey = this.configService.get('paytr.merchantKey')!;
    this.merchantSalt = this.configService.get('paytr.merchantSalt')!;
    this.testMode = this.configService.get('paytr.testMode')!;
  }

  private async getUserEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        identities: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const email = user.identities.find(
      (identity) => identity.provider === 'EMAIL',
    )?.providerId;

    if (!email) {
      return (
        user.identities.find((identity) => identity.provider === 'PHONE')
          ?.providerId + '@youway.com'
      );
    }

    return email;
  }

  async getOrderTokenIframe(
    orderId: string,
    userIp: string,
    okUrl: string,
    failUrl: string,
  ) {
    const order = await this.orderService.getOrderById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    const email = await this.getUserEmail(order.userId);

    // Default values for missing order properties
    const userName = order.customerName || 'Customer';
    const userAddress = 'Address not provided'; // Order doesn't have address field
    const userPhone = order.customerPhone || 'Phone not provided';
    const basket: [string, string, number][] = [
      ['Order', String(Number(order.totalAmount) * 100), 1],
    ];

    return this.getIframeToken({
      merchantOid: order.orderNumber,
      email: email,
      amountKurus: Math.round(Number(order.totalAmount) * 100), // Ensure it's an integer
      currency: order.currencyCode,
      userName,
      userAddress,
      userPhone,
      userIp,
      basket,
      okUrl,
      failUrl,
    });
  }

  async getIframeToken(params: {
    merchantOid: string; // sipariş/ödeme benzersiz ID
    email: string;
    amountKurus: number; // integer (kuruş)
    userName: string;
    userAddress: string;
    userPhone: string;
    userIp: string; // gerçek istemci IP (proxy varsa X-Forwarded-For'dan çekin)
    basket: Array<[string, string, number]>; // ['Ürün adı','18.00', adet]
    okUrl: string; // başarılı yönlendirme
    failUrl: string; // başarısız yönlendirme
    currency?: string;
    maxInstallment?: number; // 0=otomatik en fazla
    noInstallment?: 0 | 1; // 1=taksite izin verme
    timeoutMin?: number; // default 30
    lang?: 'tr' | 'en';
  }) {
    // Input validation
    if (
      !params.merchantOid ||
      !params.email ||
      !params.amountKurus ||
      !params.userName ||
      !params.userAddress ||
      !params.userPhone ||
      !params.userIp ||
      !params.basket ||
      !params.okUrl ||
      !params.failUrl
    ) {
      throw new Error('Tüm zorunlu parametreler sağlanmalıdır');
    }

    if (params.amountKurus <= 0) {
      throw new Error("Ödeme tutarı 0'dan büyük olmalıdır");
    }

    if (params.basket.length === 0) {
      throw new Error('Sepet boş olamaz');
    }
    const {
      merchantOid,
      email,
      amountKurus,
      userName,
      userAddress,
      userPhone,
      userIp,
      basket,
      okUrl,
      failUrl,
      currency = 'TL',
      maxInstallment = 0,
      noInstallment = 0,
      timeoutMin = 30,
      lang = 'tr',
    } = params;

    const user_basket = Buffer.from(JSON.stringify(basket)).toString('base64');

    // Hash string sırası dokümana birebir uymalı (PayTR örneğine göre):
    const hashStr = [
      this.merchantId,
      userIp,
      merchantOid,
      email,
      amountKurus,
      user_basket,
      noInstallment,
      maxInstallment,
      currency,
      this.testMode,
    ].join('');

    const paytr_token = hashStr + this.merchantSalt;

    const token = crypto
      .createHmac('sha256', this.merchantKey)
      .update(paytr_token)
      .digest('base64');

    const body = {
      merchant_id: this.merchantId,
      merchant_key: this.merchantKey,
      merchant_salt: this.merchantSalt,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: String(amountKurus),
      paytr_token: token,
      user_basket,
      debug_on: '1',
      no_installment: String(noInstallment),
      max_installment: String(maxInstallment),
      user_name: userName,
      user_address: userAddress,
      user_phone: userPhone,
      merchant_ok_url: okUrl,
      merchant_fail_url: failUrl,
      timeout_limit: String(timeoutMin),
      currency,
      test_mode: String(this.testMode),
      lang,
    };

    const options: AxiosRequestConfig = {
      method: 'POST',
      url: 'https://www.paytr.com/odeme/api/get-token',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 20000,
      data: body,
    };

    const { data } = await axios(options);

    if (data?.status !== 'success') {
      throw new Error(
        'PAYTR token alınamadı: ' + (data?.reason || 'Unknown error'),
      );
    }

    if (!data.token) {
      throw new Error('PAYTR token bulunamadı');
    }

    return data.token as string;
  }
}
