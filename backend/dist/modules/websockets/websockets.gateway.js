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
var WebsocketsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsocketsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WebsocketsGateway = WebsocketsGateway_1 = class WebsocketsGateway {
    constructor(jwtService, config) {
        this.jwtService = jwtService;
        this.config = config;
        this.logger = new common_1.Logger(WebsocketsGateway_1.name);
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth?.token || client.handshake.query?.token;
            if (!token)
                throw new Error('No token');
            const payload = this.jwtService.verify(token, {
                secret: this.config.get('JWT_SECRET'),
            });
            client.data.userId = payload.sub;
            client.data.role = payload.role;
            this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
        }
        catch {
            this.logger.warn(`Unauthorized WS connection: ${client.id}`);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleJoinDeal(data, client) {
        client.join(`deal:${data.dealId}`);
        client.emit('joined_deal', { dealId: data.dealId });
    }
    handleLeaveDeal(data, client) {
        client.leave(`deal:${data.dealId}`);
    }
    emitToDeal(dealId, event, data) {
        this.server.to(`deal:${dealId}`).emit(event, data);
    }
    emitToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    emitToAll(event, data) {
        this.server.emit(event, data);
    }
};
exports.WebsocketsGateway = WebsocketsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], WebsocketsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_deal'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebsocketsGateway.prototype, "handleJoinDeal", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_deal'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], WebsocketsGateway.prototype, "handleLeaveDeal", null);
exports.WebsocketsGateway = WebsocketsGateway = WebsocketsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*', credentials: true },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], WebsocketsGateway);
//# sourceMappingURL=websockets.gateway.js.map