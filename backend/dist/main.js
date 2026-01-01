"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const redis_adapter_1 = require("./chat/redis.adapter");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe());
    if (process.env.REDIS_HOST) {
        const redisIoAdapter = new redis_adapter_1.RedisIoAdapter(app);
        await redisIoAdapter.connectToRedis();
        app.useWebSocketAdapter(redisIoAdapter);
    }
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map