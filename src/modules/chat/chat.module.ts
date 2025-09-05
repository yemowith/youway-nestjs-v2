import { Module } from '@nestjs/common'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'

import { ChatGateway } from './chat.gateway'
import { AvatarsModule } from 'src/api/dashboards/user/profiles/avatars/avatars.module'

@Module({
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  imports: [AvatarsModule],
})
export class ChatModule {}
