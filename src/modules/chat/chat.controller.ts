import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from 'src/api/auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send a message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
  async sendMessage(@Req() req, @Body() dto: CreateMessageDto) {
    return this.chatService.sendMessage(req.user.id, dto);
  }

  @Get('list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'userId', required: true })
  @ApiOperation({ summary: 'Get chat list for a user' })
  async getChatList(@Req() req) {
    return this.chatService.getChatList(req.user.id);
  }

  @Get('messages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'otherUserId', required: true })
  @ApiOperation({ summary: 'Get all messages between two users.' })
  async getChatMessages(
    @Req() req,
    @Query('otherUserId') otherUserId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.chatService.getChatMessages(
      req.user.id,
      otherUserId,
      page,
      limit,
    );
  }
}
