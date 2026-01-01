import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async saveMessage(userId: string, streamId: string, content: string) {
    // Verify stream exists? Or rely on foreign key constraint
    return this.prisma.chatMessage.create({
      data: {
        content,
        userId,
        streamId,
      },
      include: {
        user: { select: { username: true } },
      },
    });
  }

  async getMessages(streamId: string, limit: number = 50, offset: number = 0) {
    return this.prisma.chatMessage.findMany({
      where: { streamId },
      include: {
        user: { select: { username: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: offset,
    });
  }

  async getMessageCount(streamId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: { streamId },
    });
  }

  async updateMessage(messageId: string, userId: string, content: string) {
    // Verify message exists and belongs to user
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.userId !== userId) {
      throw new Error("Unauthorized: Cannot edit another user's message");
    }

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content,
        editedAt: new Date(),
      },
      include: {
        user: { select: { username: true } },
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    // Verify message exists and belongs to user
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    if (message.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete another user's message");
    }

    return this.prisma.chatMessage.delete({
      where: { id: messageId },
      include: {
        user: { select: { username: true } },
      },
    });
  }
}
