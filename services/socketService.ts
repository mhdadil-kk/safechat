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
            // Idempotency check: If already connected or connecting, resolve immediately
            if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
                resolve();
                return;
            }

            try {
                this.ws = new WebSocket(this.serverUrl);

                this.ws.onopen = () => {
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
            const { type, ...payload } = message;

            switch (type) {
                case 'connected':
                    this.userId = message.userId;
                    break;

                case 'user_count':
                    this.emit('user_count', message.count);
                    break;

                case 'match_found':
                    this.emit('match_found');
                    break;

                case 'webrtc_offer':
                    this.handleOffer(payload.offer);
                    break;

                case 'webrtc_answer':
                    this.handleAnswer(payload.answer);
                    break;

                case 'webrtc_ice_candidate':
                    this.webrtc.handleIceCandidate(payload.candidate);
                    break;

                case 'chat_message':
                    this.emit('message_received', payload);
                    break;

                case 'partner_disconnected':
                    this.webrtc.closePeerConnection();
                    this.emit('peer_disconnected');
                    this.emit('state_change', ConnectionState.DISCONNECTED);
                    break;

                case 'start_call':
                    this.handleStartCall(payload.createOffer);
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }

    // Handle start call signal
    private async handleStartCall(shouldCreateOffer: boolean) {
        this.webrtc.initializePeerConnection();
        this.emit('state_change', ConnectionState.CONNECTING);

        if (shouldCreateOffer) {
            try {
                const offer = await this.webrtc.createOffer();
                this.send('webrtc_offer', { offer });
            } catch (error) {
                console.error('Error creating offer:', error);
            }
        }
    }

    // Handle incoming offer
    private async handleOffer(offer: RTCSessionDescriptionInit) {
        try {
            const answer = await this.webrtc.handleOffer(offer);
            this.send('webrtc_answer', { answer });
        } catch (error) {
            console.error('Error handling offer:', error);
        }
    }

    // Handle incoming answer
    private async handleAnswer(answer: RTCSessionDescriptionInit) {
        try {
            await this.webrtc.handleAnswer(answer);
        } catch (error) {
            console.error('Error handling answer:', error);
        }
    }

    // Send message to server
    send(type: string, payload: any = {}) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type, ...payload }));
        }
    }

    // Public methods
    startSearch(interests: string[] = [], mode: ChatMode = ChatMode.VIDEO) {
        this.send('start_search', { interests, mode });
        this.emit('state_change', ConnectionState.SEARCHING);
    }

    sendMessage(text: string) {
        this.send('chat_message', { text });
    }

    disconnectPeer() {
        this.send('disconnect_peer');
        this.webrtc.closePeerConnection();
        this.emit('state_change', ConnectionState.IDLE);
    }

    setLocalStream(stream: MediaStream) {
        this.webrtc.setLocalStream(stream);
    }

    // Reconnection logic
    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

        this.reconnectTimeout = window.setTimeout(() => {
            this.connect().catch(console.error);
        }, delay);
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
