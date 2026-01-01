import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
    private readonly logger = new Logger(WsJwtGuard.name);

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client = context.switchToWs().getClient();
            const token = this.extractToken(client);

            if (!token) {
                throw new WsException('Unauthorized: No token provided');
            }

            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_SECRET'),
            });

            // Attach user payload to client for use in gateways
            client.user = payload;
            return true;
        } catch (err) {
            this.logger.error(`WS Authentication failed: ${err.message}`);
            throw new WsException('Unauthorized');
        }
    }

    private extractToken(client: any): string | null {
        // Check handshake auth (preferred)
        if (client.handshake?.auth?.token) {
            return client.handshake.auth.token;
        }
        // Fallback to headers
        const authHeader = client.handshake?.headers?.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.split(' ')[1];
        }
        return null;
    }
}
