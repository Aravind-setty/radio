import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) { }

  handleConnection(client: Socket) {
    // console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    // console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('join_stream_chat')
  handleJoinRoom(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: Socket) {
    client.join(data.streamId);
    client.emit('joined_room', { streamId: data.streamId });
  }

  @SubscribeMessage('leave_stream_chat')
  handleLeaveRoom(@MessageBody() data: { streamId: string }, @ConnectedSocket() client: Socket) {
    client.leave(data.streamId);
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { streamId: string; content: string },
    @ConnectedSocket() client: any,
  ) {
    const userId = client.user.sub;
    const message = await this.chatService.saveMessage(userId, data.streamId, data.content);
    this.server.to(data.streamId).emit('chat_message', message);
  }
}
