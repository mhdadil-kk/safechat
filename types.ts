export enum ChatMode {
  VIDEO = 'video',
  TEXT = 'text'
}

export enum ConnectionState {
  IDLE = 'idle',
  SEARCHING = 'searching',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error'
}

export interface Message {
  id: string;
  sender: 'me' | 'stranger' | 'system';
  text: string;
  timestamp: number;
}

export interface UserSettings {
  interests: string[];
  isVerified: boolean;
}

export interface ReportPayload {
  reason: string;
  description: string;
  category: 'abuse' | 'nudity' | 'spam' | 'other';
}