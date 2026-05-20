import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
export declare class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly jwtService;
    private readonly config;
    private server;
    private readonly logger;
    constructor(jwtService: JwtService, config: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinDeal(data: {
        dealId: string;
    }, client: Socket): void;
    handleLeaveDeal(data: {
        dealId: string;
    }, client: Socket): void;
    emitToDeal(dealId: string, event: string, data: any): void;
    emitToUser(userId: string, event: string, data: any): void;
    emitToAll(event: string, data: any): void;
}
