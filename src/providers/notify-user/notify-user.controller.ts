import { Body, Controller, Param, Post } from '@nestjs/common'
import { NotifyUserService } from './notify-user.service'
import { NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/clients/prisma/prisma.service'

@Controller('notify-user')
export class NotifyUserController {
  constructor(
    private readonly notifyUserService: NotifyUserService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('test/:userId')
  async testNotifyUser(@Param('userId') userId: string) {
    if (!userId) throw new NotFoundException('userId param is required')
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { identities: true },
    })
    if (!user || !user.identities) {
      throw new NotFoundException('User or identities not found')
    }
    const subject = 'Test Bildirimi'
    const mail = 'Bu bir test e-posta bildirimidir.'
    const sms = 'Bu bir test SMS bildirimidir.'
    await this.notifyUserService.notifyUser(user.identities, subject, {
      mail,
      sms,
    })
    return { success: true }
  }
}
