import { Injectable } from '@nestjs/common';
import { MailService } from '../../../providers/mail/mail.service';

export interface HelpRequestDto {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

@Injectable()
export class HelpService {
  constructor(private readonly mailService: MailService) {}

  async sendHelpRequest(helpRequest: HelpRequestDto) {
    const { name, email, category, subject, message } = helpRequest;

    // Get category label
    const categoryLabels: Record<string, string> = {
      hesap: 'Hesap Sorunları',
      odeme: 'Ödeme Sorunları',
      randevu: 'Randevu Sorunları',
      teknik: 'Teknik Sorunlar',
      guvenlik: 'Güvenlik Sorunları',
      diger: 'Diğer',
    };

    const categoryLabel = categoryLabels[category] || 'Diğer';

    // Create email subject
    const emailSubject = `[Destek Talebi] ${subject}`;

    // Create email message
    const emailMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3 style="color: #2d3748; margin-bottom: 16px;">Yeni Destek Talebi</h3>
        
        <div style="background: #f7fafc; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h4 style="margin: 0 0 12px 0; color: #4a5568;">Talep Detayları</h4>
          <p style="margin: 4px 0;"><strong>Ad Soyad:</strong> ${name}</p>
          <p style="margin: 4px 0;"><strong>E-posta:</strong> ${email}</p>
          <p style="margin: 4px 0;"><strong>Kategori:</strong> ${categoryLabel}</p>
          <p style="margin: 4px 0;"><strong>Konu:</strong> ${subject}</p>
        </div>
        
        <div style="background: #fff; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h4 style="margin: 0 0 12px 0; color: #4a5568;">Mesaj</h4>
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="margin-top: 16px; padding: 12px; background: #edf2f7; border-radius: 6px; font-size: 14px; color: #4a5568;">
          <strong>Not:</strong> Bu destek talebi ${new Date().toLocaleString(
            'tr-TR',
          )} tarihinde gönderilmiştir.
        </div>
      </div>
    `;

    // Send email to support
    await this.mailService.sendNotification(
      'youwayteknolojias@gmail.com', // Support email address
      emailSubject,
      emailMessage,
    );

    // Send confirmation email to user
    const confirmationSubject = 'Destek Talebiniz Alındı';
    const confirmationMessage = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h3 style="color: #2d3748; margin-bottom: 16px;">Destek Talebiniz Alındı</h3>
        
        <p>Merhaba ${name},</p>
        
        <p>Destek talebiniz başarıyla alınmıştır. En kısa sürede size dönüş yapacağız.</p>
        
        <div style="background: #f7fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h4 style="margin: 0 0 12px 0; color: #4a5568;">Talep Özeti</h4>
          <p style="margin: 4px 0;"><strong>Konu:</strong> ${subject}</p>
          <p style="margin: 4px 0;"><strong>Kategori:</strong> ${categoryLabel}</p>
          <p style="margin: 4px 0;"><strong>Tarih:</strong> ${new Date().toLocaleString(
            'tr-TR',
          )}</p>
        </div>
        
        <p>Teşekkür ederiz.</p>
        <p><strong>Youway Destek Ekibi</strong></p>
      </div>
    `;

    await this.mailService.sendNotification(
      email,
      confirmationSubject,
      confirmationMessage,
    );

    return {
      success: true,
      message:
        'Destek talebiniz başarıyla gönderildi. E-posta adresinize onay mesajı gönderildi.',
    };
  }
}
