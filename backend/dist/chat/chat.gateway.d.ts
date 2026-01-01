import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        streamId: string;
    }, client: Socket): void;
    handleLeaveRoom(data: {
        streamId: string;
    }, client: Socket): void;
    handleMessage(data: {
        streamId: string;
        userId: string;
        content: string;
    }, client: Socket): Promise<void>;
}
