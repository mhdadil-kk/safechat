import { EventEmitter } from './eventEmitter';
import { WebRTCService } from './webrtc';
import { ConnectionState, Message, ChatMode } from '../types';

class SocketService extends EventEmitter {
    private ws: WebSocket | null = null;
    private webrtc: WebRTCService;
    private serverUrl: string;
    private userId: string | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: number | null = null;

    constructor() {
        super();
        this.webrtc = new WebRTCService();

        // Use environment variable if set, otherwise auto-detect for local development
        if (import.meta.env.VITE_SIGNALING_SERVER_URL) {
            this.serverUrl = import.meta.env.VITE_SIGNALING_SERVER_URL;
        } else {
            // Auto-detect for local development only
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const hostname = window.location.hostname;
            const port = '3001';
            this.serverUrl = `${protocol}//${hostname}:${port}`;
        }

        console.log('📡 Signaling server URL:', this.serverUrl);

        this.setupWebRTCListeners();
    }

    // Setup WebRTC event listeners
    private setupWebRTCListeners() {
        this.webrtc.on('ice_candidate', (candidate: RTCIceCandidate) => {
            this.send('webrtc_ice_candidate', { candidate });
        });

        this.webrtc.on('remote_stream', (stream: MediaStream) => {
            this.emit('remote_stream', stream);
        });

        this.webrtc.on('connection_state_change', (state: RTCPeerConnectionState) => {
            console.log('WebRTC connection state:', state);
            if (state === 'connected') {
                this.emit('state_change', ConnectionState.CONNECTED);
            }
        });

        this.webrtc.on('peer_disconnected', () => {
            this.emit('peer_disconnected');
            this.emit('state_change', ConnectionState.DISCONNECTED);
        });
    }

    // Connect to signaling server
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔌 Connecting to signaling server:', this.serverUrl);
                this.ws = new WebSocket(this.serverUrl);

                this.ws.onopen = () => {
                    console.log('✅ Connected to signaling server');
                    this.reconnectAttempts = 0;
                    this.emit('connect');
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    this.emit('error', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('🔌 Disconnected from signaling server');
                    this.emit('disconnect');
                    this.attemptReconnect();
                };
            } catch (error) {
                console.error('Failed to create WebSocket:', error);
                reject(error);
            }
        });
    }

    // Handle incoming messages from server
    private handleMessage(data: string) {
        try {
            const message = JSON.parse(data);
            const { type } = message;

            console.log('📨 Received:', type);

            switch (type) {
                case 'connected':
                    this.userId = message.userId;
                    console.log('👤 User ID:', this.userId);
                    break;

                case 'searching':
                    this.emit('state_change', ConnectionState.SEARCHING);
                    break;

                case 'match_found':
                    console.log('🎯 Match found!');
                    this.emit('match_found');
                    break;

                case 'start_call':
                    this.handleStartCall(message.shouldCreateOffer);
                    break;

                case 'webrtc_offer':
                    this.handleWebRTCOffer(message.offer);
                    break;

                case 'webrtc_answer':
                    this.handleWebRTCAnswer(message.answer);
                    break;

                case 'webrtc_ice_candidate':
                    this.handleWebRTCIceCandidate(message.candidate);
                    break;

                case 'chat_message':
                    this.handleChatMessage(message);
                    break;

                case 'peer_disconnected':
                    this.emit('peer_disconnected');
                    this.emit('state_change', ConnectionState.DISCONNECTED);
                    this.webrtc.closePeerConnection();
                    break;

                case 'disconnected':
                    this.emit('state_change', ConnectionState.DISCONNECTED);
                    this.webrtc.closePeerConnection();
                    break;

                default:
                    console.log('Unknown message type:', type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    // Handle start call signal
    private async handleStartCall(shouldCreateOffer: boolean) {
        console.log('📞 Starting call, create offer:', shouldCreateOffer);

        this.webrtc.initializePeerConnection();
        this.emit('state_change', ConnectionState.CONNECTING);

        if (shouldCreateOffer) {
            try {
                const offer = await this.webrtc.createOffer();
                this.send('webrtc_offer', { offer });
            } catch (error) {
                console.error('Error creating offer:', error);
                this.emit('error', error);
            }
        }
    }

    // Handle incoming WebRTC offer
    private async handleWebRTCOffer(offer: RTCSessionDescriptionInit) {
        try {
            const answer = await this.webrtc.handleOffer(offer);
            this.send('webrtc_answer', { answer });
        } catch (error) {
            console.error('Error handling offer:', error);
            this.emit('error', error);
        }
    }

    // Handle incoming WebRTC answer
    private async handleWebRTCAnswer(answer: RTCSessionDescriptionInit) {
        try {
            await this.webrtc.handleAnswer(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
            this.emit('error', error);
        }
    }

    // Handle incoming ICE candidate
    private handleWebRTCIceCandidate(candidate: RTCIceCandidateInit) {
        this.webrtc.handleIceCandidate(candidate);
    }

    // Handle incoming chat message
    private handleChatMessage(message: { text: string; timestamp: number }) {
        const msg: Message = {
            id: Date.now().toString(),
            sender: 'stranger',
            text: message.text,
            timestamp: message.timestamp
        };
        this.emit('message_received', msg);
    }

    // Send message to server
    private send(type: string, data: any = {}) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...data }));
        } else {
            console.warn('WebSocket not connected, cannot send:', type);
        }
    }

    // Attempt to reconnect
    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.emit('error', new Error('Failed to reconnect to server'));
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

        console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        this.reconnectTimeout = window.setTimeout(() => {
            this.connect().catch(console.error);
        }, delay);
    }

    // Public API

    // Set local stream for WebRTC
    setLocalStream(stream: MediaStream) {
        this.webrtc.setLocalStream(stream);
    }

    // Start searching for a match
    async startSearch(interests: string[], mode: ChatMode) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            await this.connect();
        }

        this.send('start_search', { interests, mode });
        this.emit('state_change', ConnectionState.SEARCHING);
    }

    // Send chat message
    sendMessage(text: string) {
        this.send('chat_message', { text });
    }

    // Disconnect from current peer
    disconnectPeer() {
        this.send('disconnect_peer');
        this.webrtc.closePeerConnection();
        this.emit('state_change', ConnectionState.DISCONNECTED);
    }

    // Get remote stream
    getRemoteStream(): MediaStream | null {
        return this.webrtc.getRemoteStream();
    }

    // Cleanup
    cleanup() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.webrtc.cleanup();
        this.removeAllListeners();
    }
}

export const socketService = new SocketService();
