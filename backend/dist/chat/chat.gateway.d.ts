import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
interface AuthenticatedSocket extends Socket {
    user: {
        sub: string;
        username: string;
    };
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        streamId: string;
    }, client: AuthenticatedSocket): void;
    handleLeaveRoom(data: {
        streamId: string;
    }, client: AuthenticatedSocket): void;
    handleTyping(data: {
        streamId: string;
    }, client: AuthenticatedSocket): void;
    handleStoppedTyping(data: {
        streamId: string;
    }, client: AuthenticatedSocket): void;
    handleMessage(data: {
        streamId: string;
        content: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleEditMessage(data: {
        messageId: string;
        content: string;
        streamId: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleDeleteMessage(data: {
        messageId: string;
        streamId: string;
    }, client: AuthenticatedSocket): Promise<void>;
    handleWebRtcOffer(data: {
        streamId: string;
        offer: any;
    }, client: AuthenticatedSocket): void;
    handleWebRtcAnswer(data: {
        streamId: string;
        answer: any;
        userId: string;
    }, client: AuthenticatedSocket): void;
    handleWebRtcIceCandidate(data: {
        streamId: string;
        candidate: any;
        userId?: string;
    }, client: AuthenticatedSocket): void;
}
export {};
