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

  // Extend Socket to include user property set by WsJwtGuard
  interface AuthenticatedSocket extends Socket {
    user: {
      sub: string;
      username: string;
    };
  }

  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('join_stream_chat')
  handleJoinRoom(
    @MessageBody() data: { streamId: string },
     @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const username = client.user.username;
    client.join(data.streamId);
    client.emit('joined_room', { streamId: data.streamId });
    // Notify other users that someone joined
    this.server
      .to(data.streamId)
      .emit('user_joined', { username, streamId: data.streamId });
  }

  @SubscribeMessage('leave_stream_chat')
  handleLeaveRoom(
    @MessageBody() data: { streamId: string },
     @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const username = client.user.username;
    client.leave(data.streamId);
    // Notify other users that someone left
    this.server
      .to(data.streamId)
      .emit('user_left', { username, streamId: data.streamId });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: { streamId: string },
     @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const username = client.user.username;
    this.server
      .to(data.streamId)
      .emit('user_typing', { username, streamId: data.streamId });
  }

  @SubscribeMessage('stopped_typing')
  handleStoppedTyping(
    @MessageBody() data: { streamId: string },
     @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const username = client.user.username;
    this.server
      .to(data.streamId)
      .emit('user_stopped_typing', { username, streamId: data.streamId });
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @MessageBody() data: { streamId: string; content: string },
    @ConnectedSocket() client: any,
  ) {
    const userId = client.user.sub;
    const message = await this.chatService.saveMessage(
      userId,
      data.streamId,
      data.content,
    );
    this.server.to(data.streamId).emit('chat_message', message);
    // Clear typing indicator when message is sent
    const username = client.user.username;
    this.server
      .to(data.streamId)
      .emit('user_stopped_typing', { username, streamId: data.streamId });
  }

  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @MessageBody()
    data: { messageId: string; content: string; streamId: string },
    @ConnectedSocket() client: any,
  ) {
    try {
      const updatedMessage = await this.chatService.updateMessage(
        data.messageId,
        client.user.sub,
        data.content,
      );
      this.server
        .to(data.streamId)
        .emit('message_edited', { ...updatedMessage, streamId: data.streamId });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string; streamId: string },
    @ConnectedSocket() client: any,
  ) {
    try {
      await this.chatService.deleteMessage(data.messageId, client.user.sub);
      this.server
        .to(data.streamId)
        .emit('message_deleted', {
          messageId: data.messageId,
          streamId: data.streamId,
        });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }
}
