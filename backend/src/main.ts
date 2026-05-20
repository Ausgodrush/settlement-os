import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const isProd = configService.get<string>('NODE_ENV') === 'production';

  app.use(helmet());
  app.use(compression());

  app.enableCors({
    origin: [frontendUrl, 'https://settlementos.com.au', 'https://www.settlementos.com.au', 'https://app.settlementos.com.au'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('v1');
  app.enableVersioning({ type: VersioningType.URI });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
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
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
    logger.log(`Swagger docs: http://localhost:${port}/docs`);
  }

  await app.listen(port);
  logger.log(`Settlement OS API running on port ${port} [${isProd ? 'production' : 'development'}]`);

  // SPA fallback: after NestJS routes are registered, catch unmatched non-API paths
  // and serve the frontend's index.html so client-side routing works on direct URL access.
  const indexPath = join(__dirname, '..', 'public', 'index.html');
  app.getHttpAdapter().getInstance().get('*', (req: any, res: any) => {
    const p = req.path as string;
    if (!p.startsWith('/v1') && !p.startsWith('/docs') && !p.startsWith('/socket.io') && !/\.\w{1,5}$/.test(p)) {
      res.sendFile(indexPath, (err: any) => {
        if (err) res.status(404).json({ statusCode: 404, message: 'Frontend not yet built — run: cd frontend && npm run build' });
      });
    }
  });
}

bootstrap();
