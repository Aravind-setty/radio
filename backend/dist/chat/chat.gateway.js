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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
const common_1 = require("@nestjs/common");
const ws_jwt_guard_1 = require("../auth/ws-jwt.guard");
let ChatGateway = class ChatGateway {
    chatService;
    server;
    constructor(chatService) {
        this.chatService = chatService;
    }
    handleConnection(client) {
        console.log('Client connected:', client.id);
    }
    handleDisconnect(client) {
        console.log('Client disconnected:', client.id);
    }
    handleJoinRoom(data, client) {
        const username = client.user.username;
        const userId = client.user.sub;
        client.join(data.streamId);
        client.emit('joined_room', { streamId: data.streamId });
        console.log(`[Chat] User ${username} (${userId}) joined stream ${data.streamId}`);
        this.server.to(data.streamId).emit('listener_joined', {
            listenerId: userId,
            username,
            streamId: data.streamId
        });
        this.server
            .to(data.streamId)
            .emit('user_joined', { username, streamId: data.streamId });
    }
    handleLeaveRoom(data, client) {
        const username = client.user.username;
        client.leave(data.streamId);
        this.server
            .to(data.streamId)
            .emit('user_left', { username, streamId: data.streamId });
    }
    handleTyping(data, client) {
        const username = client.user.username;
        this.server
            .to(data.streamId)
            .emit('user_typing', { username, streamId: data.streamId });
    }
    handleStoppedTyping(data, client) {
        const username = client.user.username;
        this.server
            .to(data.streamId)
            .emit('user_stopped_typing', { username, streamId: data.streamId });
    }
    async handleMessage(data, client) {
        const userId = client.user.sub;
        const message = await this.chatService.saveMessage(userId, data.streamId, data.content);
        this.server.to(data.streamId).emit('chat_message', message);
        const username = client.user.username;
        this.server
            .to(data.streamId)
            .emit('user_stopped_typing', { username, streamId: data.streamId });
    }
    async handleEditMessage(data, client) {
        try {
            const updatedMessage = await this.chatService.updateMessage(data.messageId, client.user.sub, data.content);
            this.server
                .to(data.streamId)
                .emit('message_edited', { ...updatedMessage, streamId: data.streamId });
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    async handleDeleteMessage(data, client) {
        try {
            await this.chatService.deleteMessage(data.messageId, client.user.sub);
            this.server.to(data.streamId).emit('message_deleted', {
                messageId: data.messageId,
                streamId: data.streamId,
            });
        }
        catch (error) {
            client.emit('error', { message: error.message });
        }
    }
    handleWebRtcOffer(data, client) {
        const username = client.user.username;
        console.log('[WebRTC Backend] Offer received from', username, 'for stream', data.streamId);
        this.server.to(data.streamId).emit('webrtc_offer', {
            offer: data.offer,
            userId: client.user.sub,
            username,
            streamId: data.streamId,
        });
        console.log('[WebRTC Backend] Offer broadcasted to room:', data.streamId);
    }
    handleWebRtcAnswer(data, client) {
        this.server.to(data.userId).emit('webrtc_answer', {
            answer: data.answer,
            listenerId: client.user.sub,
            streamId: data.streamId,
        });
    }
    handleWebRtcIceCandidate(data, client) {
        if (data.userId) {
            this.server.to(data.userId).emit('webrtc_ice_candidate', {
                candidate: data.candidate,
                from: client.user.sub,
                streamId: data.streamId,
            });
        }
        else {
            this.server.to(data.streamId).emit('webrtc_ice_candidate', {
                candidate: data.candidate,
                from: client.user.sub,
                streamId: data.streamId,
            });
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_stream_chat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_stream_chat'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stopped_typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleStoppedTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('edit_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleEditMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('delete_message'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleDeleteMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_offer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleWebRtcOffer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_answer'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleWebRtcAnswer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('webrtc_ice_candidate'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleWebRtcIceCandidate", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map