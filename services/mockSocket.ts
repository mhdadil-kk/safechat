import { ConnectionState, Message } from '../types';
import { MOCK_STRANGER_RESPONSES, MATCH_DELAY_MS, AUTO_REPLY_DELAY_MS } from '../constants';

type Listener = (...args: any[]) => void;

class MockSocketService {
  private listeners: Map<string, Listener[]> = new Map();
  private connectionState: ConnectionState = ConnectionState.IDLE;
  private matchTimeout: number | null = null;
  private replyTimeout: number | null = null;

  constructor() {
    this.connectionState = ConnectionState.IDLE;
  }

  // Event Emitter Logic
  on(event: string, callback: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback: Listener) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      this.listeners.set(event, eventListeners.filter(l => l !== callback));
    }
  }

  emit(event: string, ...args: any[]) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(cb => cb(...args));
    }
  }

  // Simulation Logic
  connect() {
    // Simulate connection to signaling server
    setTimeout(() => {
      this.emit('connect');
    }, 500);
  }

  startSearch(interests: string[], mode: string) {
    this.connectionState = ConnectionState.SEARCHING;
    this.emit('state_change', ConnectionState.SEARCHING);

    if (this.matchTimeout) clearTimeout(this.matchTimeout);

    // Simulate finding a match
    this.matchTimeout = window.setTimeout(() => {
      this.connectionState = ConnectionState.CONNECTED;
      this.emit('match_found', { partnerId: 'mock-user-123' });
      this.emit('state_change', ConnectionState.CONNECTED);
      
      // Simulate initial greeting from stranger
      this.scheduleAutoReply();
      
    }, MATCH_DELAY_MS);
  }

  disconnectPeer() {
    this.connectionState = ConnectionState.DISCONNECTED;
    this.emit('peer_disconnected');
    this.emit('state_change', ConnectionState.DISCONNECTED);
    if (this.matchTimeout) clearTimeout(this.matchTimeout);
    if (this.replyTimeout) clearTimeout(this.replyTimeout);
  }

  sendMessage(text: string) {
    // Echo back to self immediately (usually handled by frontend state, but good for confirmation)
    // this.emit('message_sent', text);
    
    // Simulate stranger reading/replying
    this.scheduleAutoReply();
  }

  private scheduleAutoReply() {
    if (this.replyTimeout) clearTimeout(this.replyTimeout);
    
    // 30% chance they don't reply immediately
    if (Math.random() > 0.7) return;

    this.replyTimeout = window.setTimeout(() => {
      if (this.connectionState !== ConnectionState.CONNECTED) return;
      
      const randomMsg = MOCK_STRANGER_RESPONSES[Math.floor(Math.random() * MOCK_STRANGER_RESPONSES.length)];
      const message: Message = {
        id: Date.now().toString(),
        sender: 'stranger',
        text: randomMsg,
        timestamp: Date.now()
      };
      
      this.emit('message_received', message);
    }, AUTO_REPLY_DELAY_MS + Math.random() * 2000);
  }
}

export const socketService = new MockSocketService();