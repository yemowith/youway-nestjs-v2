import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/clients/prisma/prisma.service';

@Injectable()
export class AttemptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async recordFailedAttempt(target: string, type: string) {
    await this.checkIfBlocked(target, type);

    const maxAttempts = this.configService.getOrThrow<number>(
      'security.attemptMaxCount',
    );

    const attempt = await this.prisma.attempt.upsert({
      where: { target_type: { target, type } },
      update: { count: { increment: 1 } },
      create: { target, type, count: 1 },
    });

    if (attempt.count >= maxAttempts) {
      const blockDuration = this.configService.getOrThrow<number>(
        'security.attemptBlockDurationMinutes',
      );
      const blockedUntil = new Date(Date.now() + blockDuration * 60 * 1000);

      await this.prisma.blockedTarget.upsert({
        where: { target_type: { target, type } },
        update: { blockedUntil },
        create: { target, type, blockedUntil },
      });
      throw new BadRequestException(
        this.configService.getOrThrow<string>(
          'messages.security.tooManyAttempts',
        ),
      );
    }
  }

  async resetAttempts(target: string, type: string) {
    await this.prisma.attempt.deleteMany({
      where: { target, type },
    });
  }

  async checkIfBlocked(target: string, type: string) {
    const blockedTarget = await this.prisma.blockedTarget.findUnique({
      where: { target_type: { target, type } },
    });

    if (blockedTarget && blockedTarget.blockedUntil > new Date()) {
      throw new BadRequestException(
        this.configService.getOrThrow<string>(
          'messages.security.accountBlocked',
        ),
      );
    }
  }
}
