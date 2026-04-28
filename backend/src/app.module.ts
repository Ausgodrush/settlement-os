import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
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
      }),
    }),

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
  ],
})
export class AppModule {}
