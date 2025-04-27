import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types for Socket.IO events
interface ServerToClientEvents {
  chat_history: (data: { chatId: string; messages: any[] }) => void;
  new_message: (data: { chatId: string; message: any }) => void;
  message_notification: (data: { chatId: string; message: any }) => void;
  messages_read: (data: { chatId: string; readBy: string }) => void;
  user_typing: (data: { chatId: string; userId: string; isTyping: boolean }) => void;
  user_status: (data: { userId: string; status: 'online' | 'offline' }) => void;
  new_chat: (data: { chat: any }) => void;
  error: (data: { message: string }) => void;
}

interface ClientToServerEvents {
  join_chat: (chatId: string) => void;
  send_message: (data: { chatId: string; content: string }) => void;
  mark_read: (data: { chatId: string }) => void;
  typing: (data: { chatId: string; isTyping: boolean }) => void;
}

class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private listeners: Map<string, Set<Function>> = new Map();
  private connected = false;
  
  // Initialize socket connection
  async connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      this.connected = true;
      return this.socket;
    }
    
    try {
      // Get the auth token
      const token = await AsyncStorage.getItem('auth_token');
      
      // Get API base URL
      const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';
      
      // Create socket connection options
      const options: any = {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
      };
      
      // Add auth token if available
      if (token) {
        options.auth = { token };
      } else {
        console.warn('No auth token found, connecting without authentication');
      }
      
      // Create socket connection
      this.socket = io(apiBaseUrl, options);
      
      // Setup event listeners
      this.setupEventListeners();
      
      return this.socket;
    } catch (error) {
      console.error('Socket connection error:', error);
      return null;
    }
  }
  
  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.connected = false;
      console.log('Socket disconnected');
    }
  }
  
  // Set up default listeners
  private setupEventListeners() {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connected = true;
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      this.connected = false;
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });
    
    this.socket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });
  }
  
  // Ensure connection before operation
  private async ensureConnection() {
    if (!this.socket || !this.connected) {
      await this.connect();
    }
    return this.socket?.connected || false;
  }
  
  // Join a chat room
  async joinChat(chatId: string) {
    const isConnected = await this.ensureConnection();
    if (!isConnected) {
      console.error('Cannot join chat: Socket not connected');
      return false;
    }
    
    this.socket?.emit('join_chat', chatId);
    return true;
  }
  
  // Send a message
  async sendMessage(chatId: string, content: string) {
    const isConnected = await this.ensureConnection();
    if (!isConnected) {
      console.error('Cannot send message: Socket not connected');
      return false;
    }
    
    this.socket?.emit('send_message', { chatId, content });
    return true;
  }
  
  // Mark messages as read
  async markMessagesAsRead(chatId: string) {
    const isConnected = await this.ensureConnection();
    if (!isConnected) {
      console.error('Cannot mark messages as read: Socket not connected');
      return false;
    }
    
    this.socket?.emit('mark_read', { chatId });
    return true;
  }
  
  // Send typing indicator
  async sendTypingStatus(chatId: string, isTyping: boolean) {
    const isConnected = await this.ensureConnection();
    if (!isConnected) {
      console.error('Cannot send typing status: Socket not connected');
      return false;
    }
    
    this.socket?.emit('typing', { chatId, isTyping });
    return true;
  }
  
  // Subscribe to an event
  async on<T extends keyof ServerToClientEvents>(
    event: T, 
    callback: ServerToClientEvents[T]
  ) {
    await this.ensureConnection();
    
    if (!this.socket) {
      console.error(`Cannot subscribe to ${event}: Socket not initialized`);
      return () => {};
    }
    
    // Add to our listeners map for tracking
    if (!this.listeners.has(event as string)) {
      this.listeners.set(event as string, new Set());
    }
    
    const callbackSet = this.listeners.get(event as string);
    callbackSet?.add(callback as Function);
    
    // Add the actual socket listener
    this.socket.on(event, callback as any);
    
    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }
  
  // Unsubscribe from an event
  off<T extends keyof ServerToClientEvents>(
    event: T, 
    callback: ServerToClientEvents[T]
  ) {
    if (!this.socket) return;
    
    // Remove from our listeners map
    const callbackSet = this.listeners.get(event as string);
    if (callbackSet) {
      callbackSet.delete(callback as Function);
    }
    
    // Remove the actual socket listener
    this.socket.off(event, callback as any);
  }
  
  // Check if socket is connected
  isConnected(): boolean {
    return this.connected && !!this.socket?.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 