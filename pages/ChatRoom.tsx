import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, SkipForward, LogOut, Flag } from 'lucide-react';
import { ChatMode, ConnectionState, Message } from '../types';
import { Button } from '../components/Button';
import { VideoFrame } from '../components/VideoFrame';
import { ChatInterface } from '../components/ChatInterface';
import { ReportModal } from '../components/ReportModal';
import { socketService } from '../services/socketService';

export const ChatRoom: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = (searchParams.get('mode') as ChatMode) || ChatMode.VIDEO;
  const interests = searchParams.get('interests')?.split(',') || [];

  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // Media State
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Refs for cleanup
  const streamRef = useRef<MediaStream | null>(null);

  // --- Initialization ---
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        // Connect to signaling server
        await socketService.connect();

        if (mode === ChatMode.VIDEO) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
          });
          setLocalStream(stream);
          streamRef.current = stream;

          // Set local stream in socket service for WebRTC
          socketService.setLocalStream(stream);
        }
        startSearching();
      } catch (err: any) {
        console.error("=== INITIALIZATION ERROR ===");
        console.error("Error object:", err);
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("===========================");

        let errorMessage = "Failed to initialize video chat. ";

        if (err.name === 'NotAllowedError') {
          errorMessage += "Camera/Microphone access was denied. Please allow permissions and refresh the page.";
        } else if (err.name === 'NotFoundError') {
          errorMessage += "No camera or microphone found on this device.";
        } else if (err.name === 'NotReadableError') {
          errorMessage += "Camera/Microphone is already in use by another application.";
        } else if (err.name === 'NotSecureError' || err.message?.includes('secure')) {
          errorMessage += "Camera access requires HTTPS. Please use https:// in the URL or access from localhost.";
        } else if (err.message?.includes('WebSocket') || err.message?.includes('connect')) {
          errorMessage += `Could not connect to server at ${err.message}. Make sure the signaling server is running on port 3001.`;
        } else if (err.message) {
          errorMessage += `Error: ${err.message}`;
        } else {
          errorMessage += `Unknown error occurred. Check browser console (F12) for details.`;
        }

        alert(errorMessage);

        // If only server connection failed but we're in text mode, continue anyway
        if (mode === ChatMode.TEXT && !err.message?.includes('getUserMedia')) {
          startSearching();
        }
      }
    };

    initializeMedia();

    // Socket Event Listeners
    socketService.on('state_change', (state: ConnectionState) => {
      setConnectionState(state);
      if (state === ConnectionState.SEARCHING) {
        setMessages([]); // Clear chat on new search
        setRemoteStream(null); // Clear remote stream
      }
    });

    socketService.on('match_found', () => {
      addSystemMessage("You're now chatting with a random stranger. Say hi!");
    });

    socketService.on('message_received', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socketService.on('remote_stream', (stream: MediaStream) => {
      console.log('📹 Received remote stream');
      setRemoteStream(stream);
    });

    socketService.on('peer_disconnected', () => {
      addSystemMessage("Stranger disconnected.");
      setRemoteStream(null);
    });

    return () => {
      // Cleanup
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      socketService.disconnectPeer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // --- Actions ---

  const startSearching = () => {
    socketService.startSearch(interests, mode);
  };

  const handleSkip = () => {
    socketService.disconnectPeer();
    startSearching();
  };

  const handleStop = () => {
    socketService.disconnectPeer();
    navigate('/');
  };

  const sendMessage = (text: string) => {
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMsg]);
    socketService.sendMessage(text);
  };

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'system',
      text,
      timestamp: Date.now()
    }]);
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  // --- Render ---

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isSearching = connectionState === ConnectionState.SEARCHING;

  return (
    <div className="h-dvh w-screen flex flex-col bg-black text-white overflow-hidden">

      {/* Top Bar (Mobile/Desktop) */}
      <div className="h-14 bg-surface border-b border-slate-700 flex items-center justify-between px-4 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className="font-medium text-sm text-slate-200">
            {isSearching ? 'Looking for someone...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setIsReportOpen(true)} className="text-slate-400 hover:text-accent">
            <Flag className="w-4 h-4 mr-1" /> Report
          </Button>
          <Button size="sm" variant="danger" onClick={handleStop} className="hidden sm:flex">
            <LogOut className="w-4 h-4 mr-1" /> End
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

        {/* Video Area */}
        {mode === ChatMode.VIDEO && (
          <div className="flex-1 relative bg-slate-900 flex flex-col md:flex-row p-2 gap-2 overflow-hidden">

            {/* Remote Video (Stranger) */}
            <div className="flex-1 relative rounded-xl overflow-hidden min-h-[30vh] md:min-h-0 bg-black shadow-lg">
              <VideoFrame
                stream={remoteStream}
                isLoading={isSearching}
                label="Stranger"
              />
            </div>

            {/* Local Video (Me) */}
            <div className="absolute md:relative bottom-4 right-4 md:bottom-0 md:right-0 w-32 h-48 md:w-auto md:h-auto md:flex-1 md:max-w-md rounded-xl overflow-hidden bg-black shadow-2xl border-2 border-slate-700 md:border-0 z-10 transition-all hover:scale-105 md:hover:scale-100">
              <VideoFrame
                stream={localStream}
                isLocal={true}
                isMuted={isMuted}
                isVideoOff={isVideoOff}
              />
            </div>

            {/* Overlay Controls (Floating on Desktop over video, sticky on mobile) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 z-20 shadow-2xl">
              <button onClick={toggleMute} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-accent text-white' : 'bg-slate-700/50 hover:bg-slate-600 text-white'}`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={toggleVideo} className={`p-3 rounded-full transition-colors ${isVideoOff ? 'bg-accent text-white' : 'bg-slate-700/50 hover:bg-slate-600 text-white'}`}>
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <div className="w-px h-6 bg-white/20 mx-1" />
              <Button
                onClick={handleSkip}
                variant="primary"
                size="md"
                isLoading={isSearching}
                className="rounded-full px-6 font-bold"
              >
                {isSearching ? 'Searching...' : <><SkipForward className="w-4 h-4 mr-2" /> Next</>}
              </Button>
            </div>
          </div>
        )}

        {/* Text Chat Area */}
        <div className={`flex flex-col bg-surface transition-all duration-300 ${mode === ChatMode.VIDEO
          ? 'h-[40vh] md:h-full md:w-[350px] lg:w-[400px] border-t md:border-t-0 md:border-l border-slate-700'
          : 'flex-1 max-w-4xl mx-auto w-full border-x border-slate-700'
          }`}>
          <ChatInterface
            messages={messages}
            onSendMessage={sendMessage}
            isDisabled={!isConnected}
            className="h-full"
          />
        </div>

      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={(data) => {
          console.log("Report submitted:", data);
          handleSkip(); // Usually skipping after reporting is good UX
        }}
      />
    </div>
  );
};