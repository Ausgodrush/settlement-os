"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const deals_module_1 = require("./modules/deals/deals.module");
const conditions_module_1 = require("./modules/conditions/conditions.module");
const documents_module_1 = require("./modules/documents/documents.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const audit_module_1 = require("./modules/audit/audit.module");
const settlement_module_1 = require("./modules/settlement/settlement.module");
const websockets_module_1 = require("./modules/websockets/websockets.module");
const integrations_module_1 = require("./modules/integrations/integrations.module");
const demo_module_1 = require("./modules/demo/demo.module");
const IS_DEMO = process.env.DEMO_MODE === 'true' ||
    (!process.env.DB_HOST && !process.env.DATABASE_URL);
if (IS_DEMO) {
    process.env.DEMO_MODE = 'true';
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET ??= 'demo-only-jwt-secret-change-before-live-xK9mP2nQ';
    process.env.PEXA_MOCK_MODE ??= 'true';
    process.env.DOCUSIGN_MOCK_MODE ??= 'true';
}
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'public'),
                exclude: ['/v1/(.*)', '/docs/(.*)'],
            }),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: IS_DEMO ? '.env.demo' : '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => {
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
                        host: config.get('DB_HOST'),
                        port: config.get('DB_PORT', 5432),
                        database: config.get('DB_NAME'),
                        username: config.get('DB_USER'),
                        password: config.get('DB_PASSWORD'),
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
                    bull_1.BullModule.forRootAsync({
                        inject: [config_1.ConfigService],
                        useFactory: (config) => ({
                            redis: {
                                host: config.get('REDIS_HOST', 'localhost'),
                                port: config.get('REDIS_PORT', 6379),
                                password: config.get('REDIS_PASSWORD') || undefined,
                            },
                        }),
                    }),
                ]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            deals_module_1.DealsModule,
            conditions_module_1.ConditionsModule,
            documents_module_1.DocumentsModule,
            notifications_module_1.NotificationsModule,
            audit_module_1.AuditModule,
            settlement_module_1.SettlementModule,
            websockets_module_1.WebsocketsModule,
            integrations_module_1.IntegrationsModule,
            ...(IS_DEMO ? [demo_module_1.DemoModule] : []),
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map