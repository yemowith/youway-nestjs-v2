import { Command, CommandRunner } from 'nest-commander';
import { PrismaService } from '../../clients/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Package } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Export all setting keys for use in other parts of the application
export const SETTING_KEYS = [
  'siteName',
  'siteDescription',
  'siteCurrency',
  'siteUrl',
  'sitePhone',
  'siteEmail',
  'supportEmail',
  'siteAddress',
  'socialFacebook',
  'socialInstagram',
  'socialTwitter',
  'socialLinkedIn',
  'socialYouTube',
  'socialTikTok',
  'appAndroid',
  'appIOS',
  'appAndroidVersion',
  'appIOSVersion',
  'appAndroidMinVersion',
  'appIOSMinVersion',
  'mainColor',
  'secondaryColor',
] as const;

// Export setting key type for TypeScript
export type SettingKey = typeof SETTING_KEYS[number];

@Injectable()
@Command({
  name: 'db:seed-settings',
  description: 'Seed the database with initial settings',
})
export class SeedSettingsCommand extends CommandRunner {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * Package verilerini seed et
   */
  private async seedPackages() {
    console.log('Seeding Packages and PackagePrices...');

    const packages = [
      {
        id: 'f1a5c1e8-0001-4000-9000-000000000001',
        name: '15 Dk Ücretsiz Tanışma',
        durationMin: 15,
        isFree: true,
        recommended: false,
        sortOrder: 1,
        canBeReplayed: false,
        isActive: true,
        color: '#00C853',
        icon: 'star',
        commission: new Decimal(0),
        image: null,
      },
      {
        id: 'f1a5c1e8-0002-4000-9000-000000000002',
        name: '15 Dk Görüşme',
        durationMin: 15,
        isFree: false,
        recommended: false,
        sortOrder: 2,
        canBeReplayed: false,
        isActive: true,
        color: '#29B6F6',
        icon: 'clock',
        commission: new Decimal(0),
        image: null,
      },
      {
        id: 'f1a5c1e8-0003-4000-9000-000000000003',
        name: '30 Dk Görüşme',
        durationMin: 30,
        isFree: false,
        recommended: true,
        sortOrder: 3,
        canBeReplayed: false,
        isActive: true,
        color: '#FFB300',
        icon: 'calendar',
        commission: new Decimal(0),
        image: null,
      },
      {
        id: 'f1a5c1e8-0004-4000-9000-000000000004',
        name: '45 Dk Görüşme',
        durationMin: 45,
        isFree: false,
        recommended: false,
        sortOrder: 4,
        canBeReplayed: false,
        isActive: true,
        color: '#EF5350',
        icon: 'timer',
        commission: new Decimal(0),
        image: null,
      },
    ];

    for (const pkg of packages) {
      await this.prisma.package.upsert({
        where: { id: pkg.id },
        update: {
          durationMin: pkg.durationMin,
          isFree: pkg.isFree,
          recommended: pkg.recommended,
          sortOrder: pkg.sortOrder,
          canBeReplayed: pkg.canBeReplayed,
          isActive: pkg.isActive,
          color: pkg.color,
          icon: pkg.icon,
          commission: pkg.commission,
          image: pkg.image,
        },
        create: pkg,
      });
    }

    // Then, seed package prices
    const packagePrices = [
      // 15 Dk Ücretsiz Tanışma
      {
        packageId: 'f1a5c1e8-0001-4000-9000-000000000001',
        priceMin: new Decimal(0),
        priceMax: new Decimal(0),
        currencyCode: 'TRY',
        isFree: true,
      },
      {
        packageId: 'f1a5c1e8-0001-4000-9000-000000000001',
        priceMin: new Decimal(0),
        priceMax: new Decimal(0),
        currencyCode: 'USD',
        isFree: true,
      },
      // 15 Dk Görüşme
      {
        packageId: 'f1a5c1e8-0002-4000-9000-000000000002',
        priceMin: new Decimal(350),
        priceMax: new Decimal(350),
        currencyCode: 'TRY',
        isFree: false,
      },
      {
        packageId: 'f1a5c1e8-0002-4000-9000-000000000002',
        priceMin: new Decimal(12),
        priceMax: new Decimal(12),
        currencyCode: 'USD',
        isFree: false,
      },
      // 30 Dk Görüşme
      {
        packageId: 'f1a5c1e8-0003-4000-9000-000000000003',
        priceMin: new Decimal(700),
        priceMax: new Decimal(700),
        currencyCode: 'TRY',
        isFree: false,
      },
      {
        packageId: 'f1a5c1e8-0003-4000-9000-000000000003',
        priceMin: new Decimal(24),
        priceMax: new Decimal(24),
        currencyCode: 'USD',
        isFree: false,
      },
      // 45 Dk Görüşme
      {
        packageId: 'f1a5c1e8-0004-4000-9000-000000000004',
        priceMin: new Decimal(950),
        priceMax: new Decimal(950),
        currencyCode: 'TRY',
        isFree: false,
      },
      {
        packageId: 'f1a5c1e8-0004-4000-9000-000000000004',
        priceMin: new Decimal(32),
        priceMax: new Decimal(32),
        currencyCode: 'USD',
        isFree: false,
      },
    ];

    for (const price of packagePrices) {
      await this.prisma.packagePrice.upsert({
        where: {
          packageId_currencyCode: {
            packageId: price.packageId,
            currencyCode: price.currencyCode,
          },
        },
        update: {
          priceMin: price.priceMin,
          priceMax: price.priceMax,
        },
        create: price,
      });
    }

    console.log('Packages and PackagePrices seeding completed!');
  }
  /**
   * GlobalDefaultAvailability verilerini seed et (Europe/Istanbul saatleriyle)
   * TR 09:00-21:00  ->  Istanbul 09:00-21:00
   * TR 09:00-16:00  ->  Istanbul 09:00-16:00
   */
  private async seedGlobalAvailability() {
    console.log('Seeding GlobalDefaultAvailability (Europe/Istanbul hours)...');

    const defaultAvailabilities = [
      {
        id: 'f1a5c1e8-0001-4000-9000-000000000001',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true,
      },
      {
        id: 'f1a5c1e8-0002-4000-9000-000000000002',
        dayOfWeek: 2,
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true,
      },
      {
        id: 'f1a5c1e8-0003-4000-9000-000000000003',
        dayOfWeek: 3,
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true,
      },
      {
        id: 'f1a5c1e8-0004-4000-9000-000000000004',
        dayOfWeek: 4,
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true,
      },
      {
        id: 'f1a5c1e8-0005-4000-9000-000000000005',
        dayOfWeek: 5,
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: true,
      },
      {
        id: 'f1a5c1e8-0006-4000-9000-000000000006',
        dayOfWeek: 6,
        startTime: '09:00',
        endTime: '16:00',
        isAvailable: true,
      },
      {
        id: 'f1a5c1e8-0007-4000-9000-000000000007',
        dayOfWeek: 0, // Sunday
        startTime: '09:00',
        endTime: '21:00',
        isAvailable: false, // kapalı
      },
    ];

    for (const availability of defaultAvailabilities) {
      await this.prisma.defaultAvailability.upsert({
        where: { id: availability.id },
        update: {
          startTime: availability.startTime,
          endTime: availability.endTime,
          isAvailable: availability.isAvailable,
        },
        create: availability,
      });
    }

    console.log(
      'GlobalDefaultAvailability seeding completed (Europe/Istanbul)!',
    );
  }

  private async seedPaymentMethods() {
    console.log('Seeding PaymentMethods...');

    const paymentMethods = [
      {
        id: 'f1a5c1e8-0001-4000-9000-000000000001',
        name: 'PayTR Sanal Pos',
        providerKey: 'paytr',
        sortOrder: 1,
        settings: [
          /*
          {
            key: 'merchantId',
            value: '123456',
            isSecret: false,
          },
          {
            key: 'merchantKey',
            value: 'xxxxxxyyyyyyzzzzz',
            isSecret: true,
          },
          {
            key: 'merchantSalt',
            value: 'randomSalt123',
            isSecret: true,
          },
          {
            key: 'isTest',
            value: 'true',
            isSecret: false,
          },
          */
        ],
        isActive: true,
      },
      {
        id: 'f1a5c1e8-0002-4000-9000-000000000002',
        name: 'IBAN',
        providerKey: 'iban',
        sortOrder: 2,
        settings: [],
        isActive: false,
      },
      {
        id: 'f1a5c1e8-0003-4000-9000-000000000003',
        name: 'Cüzdan Bakiyesi',
        providerKey: 'wallet-balance',
        sortOrder: 3,
        settings: [],
        isActive: true,
      },
    ];

    for (const paymentMethod of paymentMethods) {
      // Find existing payment method by name
      const existingPaymentMethod = await this.prisma.paymentMethod.findUnique({
        where: { name: paymentMethod.name },
      });

      if (existingPaymentMethod) {
        await this.prisma.paymentSetting.deleteMany({
          where: { paymentMethodId: existingPaymentMethod.id },
        });

        // Delete existing payment method
        await this.prisma.paymentMethod.delete({
          where: { id: existingPaymentMethod.id },
        });
      }

      // Create payment method with settings
      await this.prisma.paymentMethod.create({
        data: {
          ...paymentMethod,
          settings: {
            createMany: {
              data: paymentMethod.settings,
            },
          },
        },
      });
    }

    console.log('PaymentMethods seeding completed!');
  }

  private async seedCurrencies() {
    console.log('Seeding Currencies...');
    const currencies = [
      {
        code: 'TRY',
        name: 'Türk Lirası',
        symbol: '₺',
        isoCode: 'TRY',
        leftCode: '',
        rightCode: '₺',
      },
    ];

    for (const currency of currencies) {
      await this.prisma.currency.upsert({
        where: { code: currency.code },
        update: currency,
        create: currency,
      });
    }
  }

  private async seedSettings() {
    const settings = [
      {
        key: 'siteName',
        value: 'YouWay',
        type: 'text',
        group: 'general',
      },
      {
        key: 'siteDescription',
        value: 'YouWay - Online Terapi ve Danışmanlık Platformu',
        type: 'text',
      },
      {
        key: 'siteCurrency',
        value: 'TRY',
        type: 'text',
        group: 'general',
      },
      {
        key: 'siteUrl',
        value: 'https://youway.com',
        type: 'text',
        group: 'general',
      },
      {
        key: 'sitePhone',
        value: '+90 212 123 45 67',
        type: 'text',
        group: 'general',
      },
      {
        key: 'siteEmail',
        value: 'info@youway.com',
        type: 'text',
        group: 'general',
      },
      {
        key: 'supportEmail',
        value: 'destek@youway.com',
        type: 'text',
        group: 'general',
      },
      {
        key: 'siteAddress',
        value: 'İstanbul, Türkiye',
        type: 'text',
        group: 'general',
      },
      // Social Media Links
      {
        key: 'socialFacebook',
        value: 'https://facebook.com/youway',
        type: 'url',
        group: 'social',
      },
      {
        key: 'socialInstagram',
        value: 'https://instagram.com/youway',
        type: 'url',
        group: 'social',
      },
      {
        key: 'socialTwitter',
        value: 'https://twitter.com/youway',
        type: 'url',
        group: 'social',
      },
      {
        key: 'socialLinkedIn',
        value: 'https://linkedin.com/company/youway',
        type: 'url',
        group: 'social',
      },
      {
        key: 'socialYouTube',
        value: 'https://youtube.com/@youway',
        type: 'url',
        group: 'social',
      },
      {
        key: 'socialTikTok',
        value: 'https://tiktok.com/@youway',
        type: 'url',
        group: 'social',
      },
      // Mobile App Links
      {
        key: 'appAndroid',
        value: 'https://play.google.com/store/apps/details?id=com.youway.app',
        type: 'url',
        group: 'mobile',
      },
      {
        key: 'appIOS',
        value: 'https://apps.apple.com/app/youway/id123456789',
        type: 'url',
        group: 'mobile',
      },
      {
        key: 'appAndroidVersion',
        value: '1.0.0',
        type: 'text',
        group: 'mobile',
      },
      {
        key: 'appIOSVersion',
        value: '1.0.0',
        type: 'text',
        group: 'mobile',
      },
      {
        key: 'appAndroidMinVersion',
        value: '6.0',
        type: 'text',
        group: 'mobile',
      },
      {
        key: 'appIOSMinVersion',
        value: '13.0',
        type: 'text',
        group: 'mobile',
      },
      {
        key: 'mainColor',
        value: '#3B82F6',
        type: 'color',
        group: 'general',
      },
      {
        key: 'secondaryColor',
        value: '#1E40AF',
        type: 'color',
        group: 'general',
      },
    ];

    for (const setting of settings) {
      await this.prisma.setting.upsert({
        where: { key: setting.key },
        update: setting,
        create: setting,
      });
    }
  }

  /**
   * Runner
   */
  async run(): Promise<void> {
    try {
      console.log('Starting database settings seeding...');
      //await this.seedPackages()
      //await this.seedGlobalAvailability();
      // await this.seedPaymentMethods()
      //await this.seedCurrencies()

      await this.seedSettings();
      console.log('Database settings seeding completed successfully');
    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }
}
