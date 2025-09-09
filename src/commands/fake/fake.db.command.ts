import { Command, CommandRunner } from 'nest-commander';

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { faker } from '@faker-js/faker/locale/tr';
import { Status, User, UserStatus, UserType } from '@prisma/client';
import { PrismaService } from '../../clients/prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
@Command({
  name: 'db:fake',
  description: 'Seed the database with initial data',
})
export class FakeDbCommand extends CommandRunner {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  private async getRandomUser() {
    const count = await this.prisma.user.count({
      where: {},
    });

    if (count === 0) {
      return null;
    }

    const skip = faker.number.int({ min: 0, max: count - 1 });

    return await this.prisma.user.findFirst({
      where: {},
      skip: skip,
    });
  }

  private async createFakeComments(sellerProfileId: string) {
    // Get some individual users to create comments
    const individualUsers = await this.prisma.user.findMany({
      where: {
        type: UserType.INDIVIDUAL,
      },
      take: 10, // Get up to 10 users for comments
    });

    if (individualUsers.length === 0) {
      console.log('No individual users found for creating comments');
      return;
    }

    // Create 3-8 fake comments
    const commentCount = faker.number.int({ min: 3, max: 8 });
    const fakeComments = [
      'Çok profesyonel ve anlayışlı bir terapist. Kendimi çok rahat hissettim.',
      'Terapi sürecimde çok yardımcı oldu. Teşekkürler!',
      'Deneyimli ve güvenilir bir uzman. Kesinlikle tavsiye ederim.',
      'Sorunlarımı çözmeme yardımcı oldu. Çok memnunum.',
      'Empatik yaklaşımı ve uzmanlığı ile fark yaratıyor.',
      'Terapi seanslarım çok verimli geçiyor. Teşekkürler.',
      'Profesyonel yaklaşımı ve sabırlı tutumu ile öne çıkıyor.',
      'Kendimi güvende hissettim ve sorunlarımı çözdüm.',
      'Çok başarılı bir terapist. Herkese tavsiye ederim.',
      'Terapi sürecimde büyük ilerleme kaydettim.',
      'Uzmanlığı ve deneyimi ile fark yaratıyor.',
      'Çok memnun kaldım, teşekkürler.',
      'Profesyonel ve güvenilir bir uzman.',
      'Terapi seanslarım çok verimli geçiyor.',
      'Kendimi çok rahat hissettim ve sorunlarımı çözdüm.',
    ];

    for (let i = 0; i < commentCount; i++) {
      const randomComment = faker.helpers.arrayElement(fakeComments);
      const randomStars = faker.number.int({ min: 4, max: 5 });

      const randomUser = await this.getRandomUser();

      if (!randomUser) {
        continue;
      }

      await this.prisma.comment.create({
        data: {
          userId: randomUser.id,
          sellerProfileId,
          content: randomComment,
          stars: randomStars,
          status: 'APPROVED', // Most comments are approved
        },
      });
    }
  }

  async run(): Promise<void> {
    try {
      console.log('Starting database seeding...');

      const sellers = await this.prisma.sellerProfile.findMany();
      for (const seller of sellers) {
        await this.createFakeComments(seller.id);
      }
      console.log('Database seeding completed successfully');
    } catch (error) {
      console.error('Error during database seeding:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
