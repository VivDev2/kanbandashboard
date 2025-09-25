// client/src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connecting = false;

  connect(token: string): Socket {
    // If already connected with the same token, return existing socket
    if (this.socket?.connected && this.socket.auth.token === token) {
      return this.socket;
    }

    // If already connecting, wait for connection
    if (this.connecting) {
      return this.socket as Socket;
    }

    // Clean up existing socket
    this.disconnect();

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    this.connecting = true;
    
    this.socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
    });

    this.setupEventListeners();

    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connecting = false;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connecting = false;
      
      // Only logout if it's an authentication issue
      if (reason === 'io server disconnect') {
        // Server actively disconnected
        store.dispatch(logout());
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.connecting = false;
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        // Don't automatically logout on connection errors
        // Let the user try to reconnect manually
      }
    });

    this.socket.on('connect_failed', () => {
      console.error('Socket connection failed');
      this.connecting = false;
    });
  }

  disconnect() {
    if (this.socket) {
      // Remove all listeners to prevent memory leaks
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.connecting = false;
    }
  }

  emit(event: string,  any, callback?: (response: any) => void) {
    if (this.socket?.connected) {
      this.socket.emit(event, data, callback);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    this.socket?.off(event, callback);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // New method to check if we're currently connecting
  isConnecting(): boolean {
    return this.connecting;
  }
}

export default new SocketService();