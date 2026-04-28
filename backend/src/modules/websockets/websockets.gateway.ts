import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/',
})
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server: Server;

  private readonly logger = new Logger(WebsocketsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token as string;
      if (!token) throw new Error('No token');
      const payload = this.jwtService.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch {
      this.logger.warn(`Unauthorized WS connection: ${client.id}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_deal')
  handleJoinDeal(
    @MessageBody() data: { dealId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`deal:${data.dealId}`);
    client.emit('joined_deal', { dealId: data.dealId });
  }

  @SubscribeMessage('leave_deal')
  handleLeaveDeal(
    @MessageBody() data: { dealId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`deal:${data.dealId}`);
  }

  emitToDeal(dealId: string, event: string, data: any) {
    this.server.to(`deal:${dealId}`).emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
