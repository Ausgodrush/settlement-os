import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DealsModule } from './modules/deals/deals.module';
import { ConditionsModule } from './modules/conditions/conditions.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuditModule } from './modules/audit/audit.module';
import { SettlementModule } from './modules/settlement/settlement.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { DemoModule } from './modules/demo/demo.module';

// Demo mode activates when explicitly set, OR when no database host is configured.
// The latter means the app self-activates demo mode on hosts like Hostinger where
// no PostgreSQL is available, avoiding ECONNREFUSED crash loops.
const IS_DEMO =
  process.env.DEMO_MODE === 'true' ||
  (!process.env.DB_HOST && !process.env.DATABASE_URL);

// When self-activating demo mode (start-demo.js was not used as the startup file),
// inject required env defaults before ConfigModule initialises.
if (IS_DEMO) {
  process.env.DEMO_MODE ??= 'true';
  process.env.NODE_ENV  ??= 'development';
  process.env.JWT_SECRET ??= 'demo-only-jwt-secret-change-before-live-xK9mP2nQ';
  process.env.PEXA_MOCK_MODE     ??= 'true';
  process.env.DOCUSIGN_MOCK_MODE ??= 'true';
}

@Module({
  imports: [
    // Serve the built Next.js frontend from backend/public/ (populated by frontend postbuild)
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/v1/(.*)', '/docs/(.*)'],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: IS_DEMO ? '.env.demo' : '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        if (IS_DEMO) {
          return {
            type: 'sqljs',
            synchronize: true,
            entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
            logging: false,
          };
        }
        return {
          type: 'postgres',
          host: config.get<string>('DB_HOST'),
          port: config.get<number>('DB_PORT', 5432),
          database: config.get<string>('DB_NAME'),
          username: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
          entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          synchronize: config.get('NODE_ENV') === 'development',
          logging: config.get('NODE_ENV') === 'development',
        };
      },
    }),

    ...(IS_DEMO
      ? []
      : [
          BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              redis: {
                host: config.get('REDIS_HOST', 'localhost'),
                port: config.get<number>('REDIS_PORT', 6379),
                password: config.get('REDIS_PASSWORD') || undefined,
              },
            }),
          }),
        ]),

    AuthModule,
    UsersModule,
    DealsModule,
    ConditionsModule,
    DocumentsModule,
    NotificationsModule,
    AuditModule,
    SettlementModule,
    WebsocketsModule,
    IntegrationsModule,

    ...(IS_DEMO ? [DemoModule] : []),
  ],
})
export class AppModule {}
