import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

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

    async getMessages(streamId: string) {
        return this.prisma.chatMessage.findMany({
            where: { streamId },
            include: {
                user: { select: { username: true } },
            },
            orderBy: { createdAt: 'asc' },
            take: 50, // Limit history
        });
    }
}
