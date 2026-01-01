"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let StreamsService = class StreamsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(user, createStreamDto) {
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
    async findOne(id) {
        const stream = await this.prisma.stream.findUnique({
            where: { id },
            include: { user: { select: { username: true, id: true } } },
        });
        if (!stream) {
            throw new common_1.NotFoundException('Stream not found');
        }
        return stream;
    }
    async startStream(userId, id) {
        const stream = await this.findOne(id);
        if (stream.userId !== userId)
            throw new common_1.ForbiddenException('Not your stream');
        return this.prisma.stream.update({
            where: { id },
            data: { isActive: true },
        });
    }
    async stopStream(userId, id) {
        const stream = await this.findOne(id);
        if (stream.userId !== userId)
            throw new common_1.ForbiddenException('Not your stream');
        return this.prisma.stream.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async remove(userId, id) {
        const stream = await this.findOne(id);
        if (stream.userId !== userId)
            throw new common_1.ForbiddenException('Not your stream');
        return this.prisma.stream.delete({ where: { id } });
    }
    async findMyStreams(userId) {
        return this.prisma.stream.findMany({
            where: { userId },
            include: { user: { select: { username: true, id: true } } },
        });
    }
};
exports.StreamsService = StreamsService;
exports.StreamsService = StreamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StreamsService);
//# sourceMappingURL=streams.service.js.map