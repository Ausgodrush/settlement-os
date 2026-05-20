import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
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

// Checked at process start — must be set in OS/platform env, not just .env file
const IS_DEMO = process.env.DEMO_MODE === 'true';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: IS_DEMO ? '.env.demo' : '.env',
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions =>
        IS_DEMO
          ? {
              type: 'sqljs' as const,
              synchronize: true,
              entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
              logging: false,
            }
          : {
              type: 'postgres' as const,
              host: config.get('DB_HOST'),
              port: config.get<number>('DB_PORT', 5432),
              database: config.get('DB_NAME'),
              username: config.get('DB_USER'),
              password: config.get('DB_PASSWORD'),
              ssl: config.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
              entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
              migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
              synchronize: config.get('NODE_ENV') === 'development',
              logging: config.get('NODE_ENV') === 'development',
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
