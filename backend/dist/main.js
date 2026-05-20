"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const compression = require("compression");
const helmet_1 = require("helmet");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3001);
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
    const isProd = configService.get('NODE_ENV') === 'production';
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({
        origin: [frontendUrl, 'https://settlementos.com.au', 'https://www.settlementos.com.au', 'https://app.settlementos.com.au'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });
    app.setGlobalPrefix('v1');
    app.enableVersioning({ type: common_1.VersioningType.URI });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    if (!isProd) {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('Property Settlement OS API')
            .setDescription('Backend API for coordinating Australian property settlements')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('auth')
            .addTag('deals')
            .addTag('conditions')
            .addTag('documents')
            .addTag('settlement')
            .addTag('notifications')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup('docs', app, document);
        logger.log(`Swagger docs: http://localhost:${port}/docs`);
    }
    await app.listen(port);
    logger.log(`Settlement OS API running on port ${port} [${isProd ? 'production' : 'development'}]`);
    const indexPath = (0, path_1.join)(__dirname, '..', 'public', 'index.html');
    app.getHttpAdapter().getInstance().get('*', (req, res) => {
        const p = req.path;
        if (!p.startsWith('/v1') && !p.startsWith('/docs') && !p.startsWith('/socket.io') && !/\.\w{1,5}$/.test(p)) {
            res.sendFile(indexPath, (err) => {
                if (err)
                    res.status(404).json({ statusCode: 404, message: 'Frontend not yet built — run: cd frontend && npm run build' });
            });
        }
    });
}
bootstrap();
//# sourceMappingURL=main.js.map