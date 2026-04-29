import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';
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
    origin: [frontendUrl, 'https://settlementos.com.au', 'https://www.settlementos.com.au'],
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
}

bootstrap();
