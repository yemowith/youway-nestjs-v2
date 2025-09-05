import {
  Controller,
  Post,
  Body,
  Res,
  Headers,
  Req,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PayTrService } from './pay-tr.service';
import { Response, Request } from 'express';
import * as crypto from 'crypto';
import { PaymentService } from 'src/api/app/payment/payment.service';

@Controller('payment/pay-tr')
export class PayTrController {
  constructor(
    private readonly paytr: PayTrService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
  ) {}

  // notify_url: PayTR panelinden bu endpoint'i tanımlayın
  @Post('callback')
  async callback(@Body() post: any, @Res() res: Response) {
    const merchant_key = process.env.PAYTR_MERCHANT_KEY!;
    const merchant_salt = process.env.PAYTR_MERCHANT_SALT!;

    // Hash doğrulama
    const hashStr = `${post.merchant_oid}${merchant_salt}${post.status}${post.total_amount}`;
    const myHash = crypto
      .createHmac('sha256', merchant_key)
      .update(hashStr)
      .digest('base64');
    if (myHash !== post.hash) {
      // logla ama yine de "OK" döndürmeyin; dokümana göre hata dönebilirsiniz
      return res.status(400).send('PAYTR notification failed: bad hash');
    }

    try {
      // İdempotent işleyin: aynı merchant_oid için bir kez onaylayın
      const orderNumber = post.merchant_oid;
      const status = post.status; // "success" veya "failed"

      if (status === 'success' && orderNumber) {
        // Get order number by order ID
        const orderId = await this.paymentService.getOrderIdByNumber(
          orderNumber,
        );

        if (orderId) {
          // Call the successPayment method to handle all the business logic
          await this.paymentService.successPayment(orderId);
        }
      }

      // PayTR "OK" düz metnini bekler; başka içerik gönderme
      return res.type('text/plain').send('OK');
    } catch (error) {
      console.error('Error processing PayTR callback:', error);
      // Even if there's an error, return OK to PayTR to avoid retries
      return res.type('text/plain').send('OK');
    }
  }
}
