import { StreamsService } from './streams.service';
import { CreateStreamDto } from './dto/create-stream.dto';
export declare class StreamsController {
    private readonly streamsService;
    constructor(streamsService: StreamsService);
    create(req: any, createStreamDto: CreateStreamDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        streamUrl: string | null;
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
        streamUrl: string | null;
        isActive: boolean;
        userId: string;
    })[]>;
    findMyStreams(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        streamUrl: string | null;
        isActive: boolean;
        userId: string;
    }[]>;
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
        streamUrl: string | null;
        isActive: boolean;
        userId: string;
    }>;
    start(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        streamUrl: string | null;
        isActive: boolean;
        userId: string;
    }>;
    stop(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        streamUrl: string | null;
        isActive: boolean;
        userId: string;
    }>;
    remove(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        genre: string | null;
        description: string | null;
        type: string;
        streamUrl: string | null;
        isActive: boolean;
        userId: string;
    }>;
}
