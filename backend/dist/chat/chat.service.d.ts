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
        userId: string;
        content: string;
        streamId: string;
    }>;
    getMessages(streamId: string): Promise<({
        user: {
            username: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        content: string;
        streamId: string;
    })[]>;
}
