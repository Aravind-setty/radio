import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('streams')
export class StreamsController {
    constructor(private readonly streamsService: StreamsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Request() req, @Body() createStreamDto: CreateStreamDto) {
        return this.streamsService.create(req.user, createStreamDto);
    }

    @Get()
    findAll() {
        return this.streamsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('my')
    findMyStreams(@Request() req) {
        return this.streamsService.findMyStreams(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.streamsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/start')
    start(@Request() req, @Param('id') id: string) {
        return this.streamsService.startStream(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/stop')
    stop(@Request() req, @Param('id') id: string) {
        return this.streamsService.stopStream(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.streamsService.remove(req.user.id, id);
    }
}
