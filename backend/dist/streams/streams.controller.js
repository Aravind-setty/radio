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
exports.StreamsController = void 0;
const common_1 = require("@nestjs/common");
const streams_service_1 = require("./streams.service");
const create_stream_dto_1 = require("./dto/create-stream.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let StreamsController = class StreamsController {
    streamsService;
    constructor(streamsService) {
        this.streamsService = streamsService;
    }
    create(req, createStreamDto) {
        return this.streamsService.create(req.user, createStreamDto);
    }
    findAll() {
        return this.streamsService.findAll();
    }
    findMyStreams(req) {
        return this.streamsService.findMyStreams(req.user.id);
    }
    findOne(id) {
        return this.streamsService.findOne(id);
    }
    start(req, id) {
        return this.streamsService.startStream(req.user.id, id);
    }
    stop(req, id) {
        return this.streamsService.stopStream(req.user.id, id);
    }
    remove(req, id) {
        return this.streamsService.remove(req.user.id, id);
    }
};
exports.StreamsController = StreamsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_stream_dto_1.CreateStreamDto]),
    __metadata("design:returntype", void 0)
], StreamsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StreamsController.prototype, "findAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StreamsController.prototype, "findMyStreams", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StreamsController.prototype, "findOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/start'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StreamsController.prototype, "start", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id/stop'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StreamsController.prototype, "stop", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], StreamsController.prototype, "remove", null);
exports.StreamsController = StreamsController = __decorate([
    (0, common_1.Controller)('streams'),
    __metadata("design:paramtypes", [streams_service_1.StreamsService])
], StreamsController);
//# sourceMappingURL=streams.controller.js.map