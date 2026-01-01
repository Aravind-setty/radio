import { PrismaService } from '../prisma.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { User } from '@prisma/client';
export declare class StreamsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(user: User, createStreamDto: CreateStreamDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        isActive: boolean;
        userId: string;
    }>;
    findAll(): Promise<({
        user: {
            username: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        isActive: boolean;
        userId: string;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            username: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        isActive: boolean;
        userId: string;
    }>;
    startStream(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        isActive: boolean;
        userId: string;
    }>;
    stopStream(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        isActive: boolean;
        userId: string;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        isActive: boolean;
        userId: string;
    }>;
    findMyStreams(userId: string): Promise<({
        user: {
            username: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        isActive: boolean;
        userId: string;
    })[]>;
}
