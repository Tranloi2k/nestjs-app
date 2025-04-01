import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST'],
  },
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  clients: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    const clientId = this.generateClientId();
    this.clients.set(clientId, client);
    console.log(`Client connected: ${clientId}`);

    client.emit('your-id', { id: clientId });

    // Notify others about new user
    client.broadcast.emit('user-connected', { id: clientId });
  }

  handleDisconnect(client: Socket) {
    const clientId = this.getClientId(client);
    this.clients.delete(clientId);
    console.log(`Client disconnected: ${clientId}`);
    this.server.emit('user-disconnected', { id: clientId });
  }

  afterInit(server: Server) {
    console.log('WebSocket Gateway initialized', server);
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private getClientId(client: Socket): string {
    for (const [id, cl] of this.clients.entries()) {
      if (cl === client) return id;
    }
    return '';
  }
}
