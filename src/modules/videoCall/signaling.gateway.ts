/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface CallPayload {
  to: string;
  signal: any;
  from?: string;
}
@WebSocketGateway({
  cors: {
    origin: '*', // Trong production nên giới hạn origin cụ thể
    methods: ['GET', 'POST'],
    credentials: true,
  },
  path: '/ws',
})
export class SignalingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clients: Map<string, Socket> = new Map();
  private rooms: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    const clientId = this.generateClientId();
    this.clients.set(clientId, client);
    client.data.clientId = clientId;

    console.log(`Client connected: ${clientId}`);
    client.emit('your-id', { id: clientId });

    // Thông báo có user mới kết nối
    this.broadcastUserList();
  }

  handleDisconnect(client: Socket) {
    const clientId = client.data.clientId;
    if (!clientId) return;

    console.log(`Client disconnected: ${clientId}`);
    this.clients.delete(clientId);

    // Xóa client khỏi tất cả các phòng
    this.rooms.forEach((members, roomId) => {
      if (members.has(clientId)) {
        members.delete(clientId);
        if (members.size === 0) {
          this.rooms.delete(roomId);
        } else {
          // Thông báo cho các thành viên còn lại
          this.server.to(roomId).emit('user-left', { userId: clientId });
        }
      }
    });

    this.broadcastUserList();
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, roomId: string) {
    const clientId = client.data.clientId;

    // Kiểm tra và khởi tạo phòng nếu chưa tồn tại
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    // Lấy thông tin phòng - chắc chắn có giá trị
    const roomMembers = this.rooms.get(roomId);

    // Thêm client vào phòng
    roomMembers?.add(clientId); // Sử dụng optional chaining để an toàn
    client.join(roomId);

    console.log(`Client ${clientId} joined room ${roomId}`);

    // Gửi thông tin phòng về client
    this.server.to(roomId).emit('room-joined', {
      roomId,
      members: Array.from(roomMembers || []), // Xử lý case undefined
    });
  }
  @SubscribeMessage('call-user')
  handleCallUser(client: Socket, payload: CallPayload) {
    const targetClient = this.clients.get(payload.to);
    if (!targetClient) {
      client.emit('call-error', { message: 'User not found' });
      return;
    }

    console.log(`Call from ${payload.from} to ${payload.to}`);
    targetClient.emit('call-made', {
      signal: payload.signal,
      from: payload.from,
    });
  }

  @SubscribeMessage('answer-call')
  handleMakeAnswer(client: Socket, payload: CallPayload) {
    const targetClient = this.clients.get(payload.to);
    if (!targetClient) {
      client.emit('call-error', { message: 'User not found' });
      return;
    }

    console.log(`Answer from ${client.data.clientId} to ${payload.to}`);
    targetClient.emit('answer-made', {
      signal: payload.signal,
      from: client.data.clientId,
    });
  }

  @SubscribeMessage('reject-call')
  handleRejectCall(client: Socket, payload: { to: string }) {
    const targetClient = this.clients.get(payload.to);
    if (targetClient) {
      targetClient.emit('call-rejected', { from: client.data.clientId });
    }
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(client: Socket, payload: { to: string; candidate: any }) {
    const targetClient = this.clients.get(payload.to);
    if (targetClient) {
      targetClient.emit('ice-candidate', {
        candidate: payload.candidate,
        from: client.data.clientId,
      });
    }
  }

  private broadcastUserList() {
    const userList = Array.from(this.clients.keys());
    this.server.emit('user-list', { users: userList });
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
