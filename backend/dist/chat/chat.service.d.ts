import { PrismaService } from '../prisma.service';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    saveMessage(userId: string, streamId: string, content: string): Promise<{
        user: {
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        editedAt: Date | null;
        streamId: string;
    }>;
    getMessages(streamId: string, limit?: number, offset?: number): Promise<({
        user: {
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        editedAt: Date | null;
        streamId: string;
    })[]>;
    getMessageCount(streamId: string): Promise<number>;
    updateMessage(messageId: string, userId: string, content: string): Promise<{
        user: {
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        editedAt: Date | null;
        streamId: string;
    }>;
    deleteMessage(messageId: string, userId: string): Promise<{
        user: {
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        content: string;
        editedAt: Date | null;
        streamId: string;
    }>;
}
