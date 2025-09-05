import { Injectable } from '@nestjs/common'
import { Status, UserStatus } from '@prisma/client'
import { PrismaService } from 'src/clients/prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomeData() {
    const usersCount = await this.prisma.user.count({
      where: {
        status: UserStatus.ACTIVE,
      },
    })

    const sellerCount = await this.prisma.sellerProfile.count({
      where: {
        status: Status.confirmed,
      },
    })

    const scheduledAppointmentsCount = 0

    const completedAppointmentsCount = 0

    return {
      usersCount,
      sellerCount,
      scheduledAppointmentsCount,
      completedAppointmentsCount,
    }
  }
}
