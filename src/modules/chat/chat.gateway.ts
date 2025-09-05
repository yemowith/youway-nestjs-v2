import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Socket as IOSocket } from 'socket.io';

interface AuthenticatedSocket extends IOSocket {
  user?: any;
}

@WebSocketGateway({ cors: true }) // Enable CORS for dev
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: AuthenticatedSocket) {
    // JWT authentication
    try {
      // Try to get token from query or headers
      let token = client.handshake.query.token as string;
      if (!token && client.handshake.headers['authorization']) {
        const authHeader = client.handshake.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.slice(7);
        }
      }
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      // Attach user info to socket
      client.user = payload;
      console.log(`Client connected: ${client.id}, user: ${payload.sub}`);
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Listen for 'sendMessage' events from clients
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { receiverId: string; content: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Get userId from JWT payload attached to socket
    const user = client.user;
    if (!user) {
      client.disconnect();
      return;
    }
    const senderId = user.sub;
    const message = await this.chatService.sendMessage(senderId, {
      receiverId: data.receiverId,
      content: data.content,
      // ...other fields if needed
    });
    // Emit the message to the receiver (and optionally to the sender)
    this.server.to(data.receiverId).emit('newMessage', message);
    client.emit('newMessage', message); // echo to sender
    return message;
  }

  // Join a room for private messaging
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Only allow joining your own room
    const user = client.user;
    if (user && user.sub === data.userId) {
      client.join(data.userId);
    }
  }

  // Typing indicator: user is typing
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (user && data.receiverId) {
      console.log(`User ${user.sub} is typing to ${data.receiverId}`);
      this.server.to(data.receiverId).emit('typing', { from: user.sub });
    }
  }

  // Typing indicator: user stopped typing
  @SubscribeMessage('stopTyping')
  handleStopTyping(
    @MessageBody() data: { receiverId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (user && data.receiverId) {
      console.log(`User ${user.sub} stopped typing to ${data.receiverId}`);
      this.server.to(data.receiverId).emit('stopTyping', { from: user.sub });
    }
  }

  // Read receipt: user has read a message
  @SubscribeMessage('readMessage')
  async handleReadMessage(
    @MessageBody() data: { messageId: string; senderId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (user && data.messageId && data.senderId) {
      // Update message as read in DB
      await this.chatService.markMessageAsRead(data.messageId);
      this.server.to(data.senderId).emit('messageRead', {
        messageId: data.messageId,
        readerId: user.sub,
      });
    }
  }

  // Delete message: user deletes a message
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string; receiverId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (user && data.messageId && data.receiverId) {
      await this.chatService.markMessageAsDeleted(data.messageId);
      // Notify both sender and receiver
      this.server.to(data.receiverId).emit('messageDeleted', {
        messageId: data.messageId,
        deletedBy: user.sub,
      });
      client.emit('messageDeleted', {
        messageId: data.messageId,
        deletedBy: user.sub,
      });
    }
  }

  @SubscribeMessage('getChatList')
  async handleGetChatList(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const user = client.user;
    if (user && data.userId) {
      const conversations = await this.chatService.getChatList(data.userId);
      return conversations;
    }
  }
}
