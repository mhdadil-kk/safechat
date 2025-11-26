import React, { useRef, useEffect } from 'react';
import { MicOff, VideoOff, User, Loader2 } from 'lucide-react';

interface VideoFrameProps {
  stream?: MediaStream | null;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isLocal?: boolean;
  label?: string;
  isLoading?: boolean;
}

export const VideoFrame: React.FC<VideoFrameProps> = ({
  stream,
  isMuted = false,
  isVideoOff = false,
  isLocal = false,
  label,
  isLoading = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden rounded-xl shadow-2xl border border-slate-800/50 group">

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/90 z-20">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <p className="text-slate-400 font-medium">Connecting...</p>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Always mute local to prevent echo
        className={`w-full h-full object-cover transition-transform duration-300 ${isLocal ? 'scale-x-[-1]' : ''} ${isVideoOff || !stream ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Video Off State or No Stream */}
      {(isVideoOff || !stream) && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <div className="flex flex-col items-center text-slate-500">
            <div className="p-4 bg-slate-800 rounded-full mb-2">
              <User className="w-12 h-12" />
            </div>
            <span>{isVideoOff ? 'Camera Off' : 'Waiting for video...'}</span>
          </div>
        </div>
      )}

      {/* Overlays */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm drop-shadow-md bg-black/40 px-2 py-1 rounded">
            {label || (isLocal ? 'You' : 'Stranger')}
          </span>
          <div className="flex gap-2">
            {isMuted && <MicOff className="w-4 h-4 text-accent" />}
            {isVideoOff && <VideoOff className="w-4 h-4 text-accent" />}
          </div>
        </div>
      </div>
    </div>
  );
};