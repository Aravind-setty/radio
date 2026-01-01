import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { User } from '@prisma/client';

@Injectable()
export class StreamsService {
    constructor(private prisma: PrismaService) { }

    async create(user: User, createStreamDto: CreateStreamDto) {
        return this.prisma.stream.create({
            data: {
                ...createStreamDto,
                userId: user.id,
            },
        });
    }

    async findAll() {
        return this.prisma.stream.findMany({
            where: { isActive: true },
            include: { user: { select: { username: true, id: true } } },
        });
    }

    async findOne(id: string) {
        const stream = await this.prisma.stream.findUnique({
            where: { id },
            include: { user: { select: { username: true, id: true } } },
        });
        if (!stream) {
            throw new NotFoundException('Stream not found');
        }
        return stream;
    }

    async startStream(userId: string, id: string) {
        const stream = await this.findOne(id);
        if (stream.userId !== userId) throw new ForbiddenException('Not your stream');
        return this.prisma.stream.update({
            where: { id },
            data: { isActive: true },
        });
    }

    async stopStream(userId: string, id: string) {
        const stream = await this.findOne(id);
        if (stream.userId !== userId) throw new ForbiddenException('Not your stream');
        return this.prisma.stream.update({
            where: { id },
            data: { isActive: false },
        });
    }

    async remove(userId: string, id: string) {
        const stream = await this.findOne(id);
        if (stream.userId !== userId) throw new ForbiddenException('Not your stream');
        return this.prisma.stream.delete({ where: { id } });
    }

    // Helper for admin or system
    async findMyStreams(userId: string) {
        return this.prisma.stream.findMany({
            where: { userId },
            include: { user: { select: { username: true, id: true } } },
        });
    }
}
