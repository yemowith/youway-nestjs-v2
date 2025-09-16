import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../clients/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AvatarsService } from 'src/modules/user/avatar/avatars.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly avatarsService: AvatarsService,
  ) {}

  async sendMessage(userId: string, dto: CreateMessageDto) {
    return this.prisma.message.create({
      data: {
        ...dto,
        senderId: userId,
      },
    });
  }

  async getChatList(userId: string) {
    // Get all users the user has chatted with (sent or received)
    const sent = await this.prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const received = await this.prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });
    const userIds = [
      ...new Set([
        ...sent.map((m) => m.receiverId),
        ...received.map((m) => m.senderId),
      ]),
    ].filter((id) => id && id !== userId);
    // Optionally, fetch user details
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      },
    });
    // For each user, fetch the last message exchanged with the current user
    const userWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await this.prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: user.id },
              { senderId: user.id, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
        return {
          ...user,
          profileImage: await this.avatarsService.getProfileAvatar(user),
          lastMessage,
        };
      }),
    );
    return userWithLastMessage;
  }

  async getChatMessages(
    userId: string,
    otherUserId: string,
    page: number | string,
    limit: number | string,
  ) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      take: limitNum,
      skip: (pageNum - 1) * limitNum,
    });

    const receiver = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
      },
    });

    return {
      messages,
      receiver: {
        ...receiver,
        profileImage: await this.avatarsService.getProfileAvatar(receiver),
      },
    };
  }

  async markMessageAsRead(messageId: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true, isReadAt: new Date() },
    });
  }

  async markMessageAsDeleted(messageId: string) {
    return this.prisma.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });
  }

  async getLastMessages(userId: string, limit: number = 10) {
    // Get unique conversation partners with their latest message timestamp using groupBy
    // Only get messages where the user is the receiver (messages FROM other users)
    const conversations = await this.prisma.message.groupBy({
      by: ['senderId'],
      where: {
        receiverId: userId, // Only messages sent TO the user
        isDeleted: false,
      },
      _max: {
        createdAt: true, // Get the latest message timestamp per sender
      },
      orderBy: {
        _max: {
          createdAt: 'desc', // Order by latest message first
        },
      },
      take: limit,
    });

    // Extract unique sender IDs (other users who sent messages to the current user)
    const senderIds = conversations
      .map((conv) => conv.senderId)
      .filter((senderId) => senderId !== null);

    // Get the actual last messages from each sender
    const lastMessages = await Promise.all(
      senderIds.map(async (senderId) => {
        const lastMessage = await this.prisma.message.findFirst({
          where: {
            senderId: senderId,
            receiverId: userId,
            isDeleted: false,
          },
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
            receiver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        });
        return lastMessage;
      }),
    );

    // Filter out null messages and sort by creation date
    const validMessages = lastMessages
      .filter((message) => message !== null)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    // Process messages to include avatar URLs
    return await Promise.all(
      validMessages.map(async (message) => ({
        ...message,
        sender: {
          ...message.sender,
          profileImage: await this.avatarsService.getProfileAvatar(
            message.sender,
          ),
        },
        receiver: {
          ...message.receiver,
          profileImage: await this.avatarsService.getProfileAvatar(
            message.receiver,
          ),
        },
      })),
    );
  }
}
