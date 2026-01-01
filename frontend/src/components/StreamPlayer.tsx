import { useEffect, useRef, useState } from "react";
import { useStreamStore } from "../store/streamStore";
import { Button } from "./ui/button";
import { X, Volume2, VolumeX, Mic, AlertCircle } from "lucide-react";
import { WebRTCManager } from "../lib/webrtc";
import io from "socket.io-client";
import { useAuthStore } from "../store/authStore";

export default function StreamPlayer() {
  const { activeStream, setActiveStream, myStreamId, streams } =
    useStreamStore();
  const { user, token } = useAuthStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [micError, setMicError] = useState<string>("");
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  // Get the user's broadcasting stream if active
  const myBroadcastStream = streams.find(
    (s) => s.id === myStreamId && s.isActive
  );

  useEffect(() => {
    // Stream audio managed by WebRTC or browser-based streaming protocol
    if (activeStream) {
      setIsPlaying(false);
    }
  }, [activeStream]);

  // Setup WebRTC for broadcasting
  useEffect(() => {
    if (myBroadcastStream && !webrtcRef.current) {
      setupBroadcaster();
    }

    return () => {
      if (webrtcRef.current) {
        webrtcRef.current.stopBroadcast();
        webrtcRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [myBroadcastStream]);

  // Setup WebRTC for listening
  useEffect(() => {
    if (activeStream && !webrtcRef.current) {
      setupListener();
    }

    return () => {
      if (webrtcRef.current && !myBroadcastStream) {
        webrtcRef.current.stopBroadcast();
        webrtcRef.current = null;
      }
    };
  }, [activeStream, myBroadcastStream]);

  const setupBroadcaster = async () => {
    try {
      if (!socketRef.current) {
        socketRef.current = io(window.location.origin, {
          auth: { token },
          reconnection: true,
        });
      }

      const socket = socketRef.current;

      // Join room FIRST
      socket.emit("join_stream_chat", { streamId: myStreamId });
      console.log("[WebRTC] Broadcaster joined stream room:", myStreamId);

      // Wait for room join to complete
      await new Promise((resolve) => setTimeout(resolve, 500));

      const webrtc = new WebRTCManager({
        streamId: myStreamId!,
        socket,
        userId: user?.id || "",
        isBroadcaster: true,
      });

      console.log("[WebRTC] Starting broadcast...");
      await webrtc.startBroadcast();

      console.log("[WebRTC] Notifying server broadcaster is ready...");
      // Just notify that broadcaster is ready - offers will be created when listeners join
      await webrtc.createAndSendOffer();

      webrtcRef.current = webrtc;
      setMicError("");
      console.log("[WebRTC] Broadcast setup complete - waiting for listeners");
    } catch (error) {
      console.error("[WebRTC] Broadcaster setup failed:", error);
      setMicError(
        error instanceof Error ? error.message : "Failed to start broadcast"
      );
    }
  };

  const setupListener = async () => {
    try {
      if (!socketRef.current) {
        socketRef.current = io(window.location.origin, {
          auth: { token },
          reconnection: true,
        });
      }

      const socket = socketRef.current;
      const streamId = activeStream!.id;

      console.log("[WebRTC] Listener joining stream:", streamId);
      socket.emit("join_stream_chat", { streamId });

      const webrtc = new WebRTCManager({
        streamId,
        socket,
        userId: user?.id || "",
        isBroadcaster: false,
      });

      let streamAssigned = false;
      webrtc.setOnRemoteStream((stream) => {
        console.log("[WebRTC] Received remote stream");
        // Only assign stream once to prevent interruptions
        if (audioRef.current && !streamAssigned) {
          streamAssigned = true;
          audioRef.current.srcObject = stream;
          setIsPlaying(true);
          // Auto-play the audio
          audioRef.current.play().catch((err) => {
            console.error("[WebRTC] Auto-play failed:", err);
            setIsPlaying(false);
          });
        }
      });

      webrtcRef.current = webrtc;
      setMicError("");
      console.log("[WebRTC] Listener setup complete");
    } catch (error) {
      console.error("[WebRTC] Listener setup failed:", error);
      setMicError(error instanceof Error ? error.message : "Failed to listen");
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((e) => {
          console.error("Play error:", e);
          setMicError("Failed to play audio");
        });
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

  // Show error banner
  if (micError) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-900 border-t border-red-700 p-4 text-white flex items-center gap-3 shadow-2xl z-50">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">Audio Error</p>
          <p className="text-xs text-red-200">{micError}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setMicError("")}
          className="text-red-200 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Show listening player
  if (activeStream && user) {
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
            autoPlay
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

  // Show broadcasting indicator
  if (myBroadcastStream) {
    const isSetup = webrtcRef.current !== null;
    const status = isSetup
      ? "Broadcasting with WebRTC ✓"
      : "Initializing WebRTC...";
    const statusColor = isSetup ? "text-green-200" : "text-yellow-200";

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-900/90 border-t border-red-700 p-4 text-white flex items-center justify-between shadow-2xl z-50">
        <div className="flex items-center space-x-4">
          <div className="bg-red-600 w-12 h-12 rounded-full flex items-center justify-center animate-pulse">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">📡 {myBroadcastStream.title}</h3>
            <p className={`text-sm ${statusColor}`}>{status}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-red-100">
            {myBroadcastStream.genre && `Genre: ${myBroadcastStream.genre}`}
          </span>
        </div>
      </div>
    );
  }

  return null;
}
