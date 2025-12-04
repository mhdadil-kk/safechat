import { EventEmitter } from './eventEmitter';

interface WebRTCConfig {
    iceServers: RTCIceServer[];
}

export class WebRTCService extends EventEmitter {
    private peerConnection: RTCPeerConnection | null = null;
    private config: WebRTCConfig;
    private localStream: MediaStream | null = null;
    private remoteStream: MediaStream | null = null;

    constructor() {
        super();

        // Get TURN credentials from environment variables (optional)
        const turnUsername = import.meta.env.VITE_TURN_USERNAME;
        const turnPassword = import.meta.env.VITE_TURN_PASSWORD;

        this.config = {
            iceServers: [
                // STUN servers - for NAT discovery
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },

                // TURN servers - for relay when direct P2P connection fails
                // Using Metered's TURN servers (https://www.metered.ca/tools/openrelay/)
                // Add your credentials to .env.local for production use
                {
                    urls: [
                        'turn:a.relay.metered.ca:80',
                        'turn:a.relay.metered.ca:80?transport=tcp',
                        'turn:a.relay.metered.ca:443',
                        'turns:a.relay.metered.ca:443?transport=tcp'
                    ],
                    username: (turnUsername || 'openrelayproject').trim(),
                    credential: (turnPassword || 'openrelayproject').trim()
                }
            ]
        };
    }

    // Initialize peer connection
    initializePeerConnection() {
        if (this.peerConnection) {
            this.closePeerConnection();
        }

        this.peerConnection = new RTCPeerConnection(this.config);
        this.remoteStream = new MediaStream();

        // Handle ICE candidates
        this.peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.emit('ice_candidate', event.candidate);
            }
        };

        // Handle incoming tracks (remote stream)
        this.peerConnection.ontrack = (event) => {
            event.streams[0].getTracks().forEach((track) => {
                this.remoteStream?.addTrack(track);
            });
            this.emit('remote_stream', this.remoteStream);
        };

        // Handle connection state changes
        this.peerConnection.onconnectionstatechange = () => {
            const state = this.peerConnection?.connectionState;
            this.emit('connection_state_change', state);

            if (state === 'disconnected' || state === 'failed' || state === 'closed') {
                this.emit('peer_disconnected');
            }
        };

        // Handle ICE connection state
        this.peerConnection.oniceconnectionstatechange = () => {
            const state = this.peerConnection?.iceConnectionState;
        };

        // Add local stream tracks to peer connection
        if (this.localStream) {
            this.localStream.getTracks().forEach((track) => {
                this.peerConnection?.addTrack(track, this.localStream!);
            });
        }

        return this.peerConnection;
    }

    // Set local media stream
    setLocalStream(stream: MediaStream) {
        this.localStream = stream;

        // If peer connection already exists, add tracks
        if (this.peerConnection) {
            stream.getTracks().forEach((track) => {
                this.peerConnection?.addTrack(track, stream);
            });
        }
    }

    // Create and return an offer
    async createOffer(): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        const offer = await this.peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
        });

        await this.peerConnection.setLocalDescription(offer);

        return offer;
    }

    // Handle incoming offer and create answer
    async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);

        return answer;
    }

    // Handle incoming answer
    async handleAnswer(answer: RTCSessionDescriptionInit) {
        if (!this.peerConnection) {
            throw new Error('Peer connection not initialized');
        }

        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    // Handle incoming ICE candidate
    async handleIceCandidate(candidate: RTCIceCandidateInit) {
        if (!this.peerConnection) {
            return;
        }

        try {
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
            console.error('Error adding ICE candidate:', error);
        }
    }

    // Get remote stream
    getRemoteStream(): MediaStream | null {
        return this.remoteStream;
    }

    async replaceVideoTrack(newTrack: MediaStreamTrack) {
        if (this.peerConnection) {
            const sender = this.peerConnection.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
                await sender.replaceTrack(newTrack);
            }
        }
    }

    // Close peer connection
    closePeerConnection() {
        if (this.peerConnection) {
            this.peerConnection.close();
            this.peerConnection = null;
        }

        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => track.stop());
            this.remoteStream = null;
        }
    }

    // Cleanup
    cleanup() {
        this.closePeerConnection();

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        this.removeAllListeners();
    }
}
