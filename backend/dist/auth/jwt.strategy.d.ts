import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: any): Promise<{
        email: string;
        username: string;
        id: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
export {};
