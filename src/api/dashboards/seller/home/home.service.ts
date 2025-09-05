import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/clients/prisma/prisma.service'

@Injectable()
export class HomeService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomeData(sellerId: string): Promise<any> {
    return {}
  }
}
