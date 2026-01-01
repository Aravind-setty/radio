import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@Module({
  imports: [AuthModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, WsJwtGuard],
})
export class ChatModule {}
