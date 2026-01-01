import { useEffect, useRef } from "react";
import { useStreamStore } from "../store/streamStore";
import { Button } from "./ui/button";
import { X, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";

export default function StreamPlayer() {
  const { activeStream, setActiveStream } = useStreamStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    // Stream audio managed by WebRTC or browser-based streaming protocol
    if (activeStream) {
      setIsPlaying(false);
    }
  }, [activeStream]);

  if (!activeStream) return null;

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 text-white flex items-center justify-between shadow-2xl z-50">
      <div className="flex items-center space-x-4">
        <div className="bg-red-500 w-12 h-12 rounded-full flex items-center justify-center animate-pulse">
          <span className="font-bold text-xs">LIVE</span>
        </div>
        <div>
          <h3 className="font-bold text-lg">{activeStream.title}</h3>
          <p className="text-sm text-gray-400">
            by {activeStream.user.username}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />

        <Button onClick={toggleMute} variant="ghost" size="icon">
          {muted ? (
            <VolumeX className="text-gray-400" />
          ) : (
            <Volume2 className="text-white" />
          )}
        </Button>

        <Button
          onClick={togglePlay}
          variant="outline"
          className="w-24 border-gray-600"
        >
          {isPlaying ? "Pause" : "Play"}
        </Button>

        <Button
          onClick={() => setActiveStream(null)}
          variant="ghost"
          size="icon"
        >
          <X className="text-gray-400 hover:text-white" />
        </Button>
      </div>
    </div>
  );
}
