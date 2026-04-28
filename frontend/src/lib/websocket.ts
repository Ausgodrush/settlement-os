import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './auth';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    const token = getAccessToken();
    socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinDeal(dealId: string) {
  const s = getSocket();
  s.emit('join_deal', { dealId });
}

export function leaveDeal(dealId: string) {
  const s = getSocket();
  s.emit('leave_deal', { dealId });
}
