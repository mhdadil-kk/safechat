import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, SkipForward, LogOut, Flag, MessageSquare } from 'lucide-react';
import { ChatMode, ConnectionState, Message } from '../types';
import { Button } from '../components/Button';
import { VideoFrame } from '../components/VideoFrame';
import { ChatInterface } from '../components/ChatInterface';
import { ReportModal } from '../components/ReportModal';
import { socketService } from '../services/socketService';
import { GridBackground } from '../components/GridBackground';
import toast from 'react-hot-toast';

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
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
              facingMode: 'user'
            },
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            }
          });
          setLocalStream(stream);
          streamRef.current = stream;

          // Set local stream in socket service for WebRTC
          socketService.setLocalStream(stream);
        }
        startSearching();
      } catch (err: any) {
        console.error("=== INITIALIZATION ERROR ===");
        // Error handling logic
        let errorMessage = "Failed to initialize video chat. ";
        if (err.name === 'NotAllowedError') errorMessage += "Camera/Microphone access denied.";
        else if (err.name === 'NotFoundError') errorMessage += "No camera/microphone found.";
        else if (err.name === 'NotReadableError') errorMessage += "Hardware already in use.";
        else if (err.name === 'NotSecureError') errorMessage += "HTTPS required.";
        else errorMessage += err.message || "Unknown error.";

        toast.error(errorMessage);
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
        setMessages([]);
        setRemoteStream(null);
      }
    });

    socketService.on('match_found', () => {
      addSystemMessage("You're now chatting with a random stranger. Say hi!");
    });

    socketService.on('message_received', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socketService.on('remote_stream', (stream: MediaStream) => {
      setRemoteStream(stream);
    });

    socketService.on('peer_disconnected', () => {
      addSystemMessage("Stranger disconnected.");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      socketService.disconnectPeer();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // --- Actions ---

  const startSearching = () => {
    if (mode === ChatMode.VIDEO) {
      const videoTrack = localStream?.getVideoTracks()[0];
      if (!videoTrack || !videoTrack.enabled) {
        toast.error("Please turn on your camera to start searching.");
        return;
      }
    }
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

      if (isVideoOff) {
        toast.success("Camera turned on");
      } else {
        toast.error("Camera turned off");
      }
    }
  };

  // --- Render ---

  const isConnected = connectionState === ConnectionState.CONNECTED;
  const isSearching = connectionState === ConnectionState.SEARCHING;

  return (
    <div className="h-dvh w-screen flex flex-col overflow-hidden relative bg-black text-white">

      {/* 1. Global Background */}
      <GridBackground />

      {/* 2. Header (Glassmorphic) */}
      <div className="h-16 flex items-center justify-between px-4 z-20 shrink-0 bg-black/20 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Vissoo" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">Vissoo</span>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-[#D4F932]' : 'bg-yellow-500 animate-pulse'}`} />
              <span className="text-xs text-slate-300 font-medium">
                {isSearching ? 'Searching...' : isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setIsReportOpen(true)} className="text-slate-400 hover:text-[#D4F932] hover:bg-[#D4F932]/10">
            <Flag className="w-4 h-4 mr-1" /> Report
          </Button>
          <Button size="sm" variant="danger" onClick={handleStop} className="hidden sm:flex bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">
            <LogOut className="w-4 h-4 mr-1" /> End
          </Button>
        </div>
      </div>

      {/* 3. Main Content (Distinct Layouts) */}

      {/* --- VIDEO MODE LAYOUT --- */}
      {mode === ChatMode.VIDEO && (
        <div className="flex-1 flex flex-col md:flex-row p-2 md:p-4 gap-4 overflow-hidden z-10">

          {/* Video Grid */}
          <div className="flex-1 grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-4 relative min-h-0">

            {/* Remote Video */}
            <div className="relative rounded-2xl overflow-hidden bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl">
              <VideoFrame stream={remoteStream} isLoading={isSearching} label="Stranger" />
            </div>

            {/* Local Video */}
            <div className="relative rounded-2xl overflow-hidden bg-black/20 backdrop-blur-md border border-white/10 shadow-2xl">
              <VideoFrame stream={localStream} isLocal={true} isMuted={isMuted} isVideoOff={isVideoOff} />
            </div>

            {/* Floating Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-xl p-3 rounded-full border border-white/10 z-30 shadow-2xl w-max max-w-[90%] overflow-x-auto">
              <button onClick={toggleMute} className={`p-3 rounded-full transition-all ${isMuted ? 'bg-[#D4F932] text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={toggleVideo} className={`p-3 rounded-full transition-all ${isVideoOff ? 'bg-[#D4F932] text-black' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <div className="w-px h-8 bg-white/20" />
              <Button
                onClick={handleSkip}
                className="rounded-full px-8 font-bold bg-[#D4F932] hover:bg-[#B8D92C] text-black shadow-[0_0_20px_rgba(212,249,50,0.2)]"
                isLoading={isSearching}
              >
                {isSearching ? 'Searching...' : <><SkipForward className="w-5 h-5 mr-2" /> Next</>}
              </Button>
            </div>
          </div>

          {/* Chat Sidebar (Desktop Only for Video Mode) */}
          <div className="hidden lg:flex w-96 flex-col bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 font-semibold text-slate-300 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#D4F932]" /> Chat
            </div>
            <ChatInterface messages={messages} onSendMessage={sendMessage} isDisabled={!isConnected} className="flex-1" />
          </div>

        </div>
      )}

      {/* --- TEXT MODE LAYOUT --- */}
      {mode === ChatMode.TEXT && (
        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <div className="w-full max-w-4xl h-[85vh] bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">

            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4F932]/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            {/* Chat Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-2xl font-bold text-white">Text Chat</h2>
                <p className="text-slate-400 text-sm">Anonymous conversation with a stranger</p>
              </div>
              <Button
                onClick={handleSkip}
                className="bg-[#D4F932] hover:bg-[#B8D92C] text-black font-bold px-6 rounded-full"
                isLoading={isSearching}
              >
                <SkipForward className="w-4 h-4 mr-2" /> Next Person
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-hidden bg-black/20">
              <ChatInterface messages={messages} onSendMessage={sendMessage} isDisabled={!isConnected} className="h-full" />
            </div>

          </div>
        </div>
      )}

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSubmit={(data) => {
          handleSkip();
        }}
      />
    </div>
  );
};