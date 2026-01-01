import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Patch,
  Delete,
  Body,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface UpdateMessageDto {
  content: string;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':streamId')
  getMessages(
    @Param('streamId') streamId: string,
    @Query('limit') limit: string = '50',
    @Query('offset') offset: string = '0',
  ) {
    const limitNum = Math.min(Math.max(parseInt(limit) || 50, 1), 100); // Max 100 messages per request
    const offsetNum = Math.max(parseInt(offset) || 0, 0);
    return this.chatService.getMessages(streamId, limitNum, offsetNum);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':messageId')
  async updateMessage(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Request() req,
  ) {
    if (!updateMessageDto.content || !updateMessageDto.content.trim()) {
      throw new BadRequestException('Message content cannot be empty');
    }
    try {
      return await this.chatService.updateMessage(
        messageId,
        req.user.sub,
        updateMessageDto.content,
      );
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':messageId')
  async deleteMessage(@Param('messageId') messageId: string, @Request() req) {
    try {
      return await this.chatService.deleteMessage(messageId, req.user.sub);
    } catch (error) {
      if (error.message.includes('Unauthorized')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
