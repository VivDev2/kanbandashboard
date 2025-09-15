// client/src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import { addNotification, updateStats } from '../redux/slices/dashboardSlice';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('user:actionRequired', (data) => {
      store.dispatch(addNotification({
        id: Date.now(),
        type: 'info',
        message: data.message,
        timestamp: new Date(),
      }));
    });

    this.socket.on('dashboard:update', (data) => {
      store.dispatch(updateStats(data.stats));
    });

    this.socket.on('admin:approvalRequest', (data) => {
      store.dispatch(addNotification({
        id: Date.now(),
        type: 'warning',
        message: `Approval request from ${data.userName}`,
        timestamp: new Date(),
      }));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event: string,  any) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export default new SocketService();