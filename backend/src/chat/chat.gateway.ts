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
@UseGuards(WsJwtGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) { }

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
    const userId = client.user.sub;

    client.join(data.streamId);
    client.emit('joined_room', { streamId: data.streamId });

    console.log(`[Chat] User ${username} (${userId}) joined stream ${data.streamId}`);

    // Notify broadcaster that a listener has joined (for WebRTC)
    this.server.to(data.streamId).emit('listener_joined', {
      listenerId: userId,
      username,
      streamId: data.streamId
    });

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
    @ConnectedSocket() client: AuthenticatedSocket,
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
    @ConnectedSocket() client: AuthenticatedSocket,
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
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string; streamId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      await this.chatService.deleteMessage(data.messageId, client.user.sub);
      this.server.to(data.streamId).emit('message_deleted', {
        messageId: data.messageId,
        streamId: data.streamId,
      });
    } catch (error: any) {
      client.emit('error', { message: error.message });
    }
  }

  // WebRTC Signaling Events
  @SubscribeMessage('webrtc_offer')
  handleWebRtcOffer(
    @MessageBody() data: { streamId: string; offer: any },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const username = client.user.username;
    console.log(
      '[WebRTC Backend] Offer received from',
      username,
      'for stream',
      data.streamId,
    );
    // Broadcast offer to all listeners in the stream room
    this.server.to(data.streamId).emit('webrtc_offer', {
      offer: data.offer,
      userId: client.user.sub,
      username,
      streamId: data.streamId,
    });
    console.log('[WebRTC Backend] Offer broadcasted to room:', data.streamId);
  }

  @SubscribeMessage('webrtc_answer')
  handleWebRtcAnswer(
    @MessageBody() data: { streamId: string; answer: any; userId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Send answer back to the broadcaster
    this.server.to(data.userId).emit('webrtc_answer', {
      answer: data.answer,
      listenerId: client.user.sub,
      streamId: data.streamId,
    });
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleWebRtcIceCandidate(
    @MessageBody() data: { streamId: string; candidate: any; userId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Broadcast ICE candidate to relevant peers
    if (data.userId) {
      // Send to specific user (broadcaster)
      this.server.to(data.userId).emit('webrtc_ice_candidate', {
        candidate: data.candidate,
        from: client.user.sub,
        streamId: data.streamId,
      });
    } else {
      // Broadcast to all in room
      this.server.to(data.streamId).emit('webrtc_ice_candidate', {
        candidate: data.candidate,
        from: client.user.sub,
        streamId: data.streamId,
      });
    }
  }
}
