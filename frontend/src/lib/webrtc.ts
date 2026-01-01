import io from "socket.io-client";

const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

export interface WebRTCConfig {
  streamId: string;
  socket: ReturnType<typeof io>;
  userId: string;
  isBroadcaster: boolean;
}

export class WebRTCManager {
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private socket: ReturnType<typeof io>;
  private streamId: string;
  // private userId: string; // Not currently used
  private isBroadcaster: boolean;
  private onRemoteStream?: (stream: MediaStream, userId: string) => void;

  constructor(config: WebRTCConfig) {
    this.socket = config.socket;
    this.streamId = config.streamId;
    // this.userId = config.userId; // Not currently used
    this.isBroadcaster = config.isBroadcaster;
    this.setupSocketListeners();
  }

  // Get user's microphone for broadcasting
  async startBroadcast(): Promise<MediaStream> {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Your browser doesn't support microphone access. Please use a modern browser like Chrome, Firefox, or Edge."
        );
      }

      console.log("[WebRTC] Requesting microphone access...");

      // Try with optimal constraints first
      try {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      } catch (err) {
        // Fallback to basic constraints if advanced constraints fail
        console.warn("[WebRTC] Advanced constraints failed, trying basic...");
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      }

      console.log("[WebRTC] Microphone access granted");
      console.log("[WebRTC] Audio tracks:", this.localStream.getAudioTracks().length);

      return this.localStream;
    } catch (error: any) {
      console.error("[WebRTC] Microphone access error:", error);

      // Provide user-friendly error messages
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        throw new Error(
          "Microphone permission denied. Please allow microphone access in your browser settings and try again."
        );
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        throw new Error(
          "No microphone found. Please connect a microphone and try again."
        );
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        throw new Error(
          "Microphone is already in use by another application. Please close other apps using the microphone and try again."
        );
      } else if (error.name === "OverconstrainedError") {
        throw new Error(
          "Your microphone doesn't meet the required settings. Please try a different microphone."
        );
      } else if (error.name === "SecurityError") {
        throw new Error(
          "Microphone access blocked for security reasons. If you're not using HTTPS, microphone access may be restricted."
        );
      }

      throw new Error(
        error.message || "Failed to access microphone. Please enable microphone permissions."
      );
    }
  }

  // Create offer as broadcaster (called when a listener joins)
  async createAndSendOffer(): Promise<void> {
    if (!this.localStream) {
      throw new Error("Local stream not initialized");
    }

    try {
      // Note: This creates an initial offer that will be broadcasted
      // Actual peer connections will be created when listeners respond
      console.log("[WebRTC] Broadcaster ready to accept listeners");

      // Notify the server that broadcaster is ready
      this.socket.emit("broadcaster_ready", {
        streamId: this.streamId
      });
    } catch (error) {
      console.error("Error setting up broadcaster:", error);
      throw error;
    }
  }

  // Create offer for a specific listener
  async createOfferForListener(listenerId: string): Promise<void> {
    if (!this.localStream) {
      throw new Error("Local stream not initialized");
    }

    try {
      const peerConnection = this.createPeerConnection(listenerId);

      console.log(
        "[WebRTC] Adding local stream tracks:",
        this.localStream.getTracks().length
      );

      // Add local stream tracks
      this.localStream.getTracks().forEach((track) => {
        console.log("[WebRTC] Adding track:", track.kind);
        peerConnection.addTrack(track, this.localStream!);
      });

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });

      await peerConnection.setLocalDescription(offer);

      console.log("[WebRTC] Sending offer to listener:", listenerId);
      this.socket.emit("webrtc_offer", {
        streamId: this.streamId,
        offer: offer,
        targetUserId: listenerId
      });
    } catch (error) {
      console.error("Error creating offer for listener:", error);
      throw error;
    }
  }

  // Create peer connection for listener
  async handleOffer(
    offer: RTCSessionDescriptionInit,
    broadcasterId: string
  ): Promise<void> {
    try {
      const peerConnection = this.createPeerConnection(broadcasterId);

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.socket.emit("webrtc_answer", {
        streamId: this.streamId,
        answer: answer,
        userId: broadcasterId,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
      throw error;
    }
  }

  // Handle answer from listener
  async handleAnswer(
    answer: RTCSessionDescriptionInit,
    listenerId: string
  ): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(listenerId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    } catch (error) {
      console.error("Error handling answer:", error);
      throw error;
    }
  }

  // Handle ICE candidate
  async handleIceCandidate(
    candidate: RTCIceCandidate,
    fromUserId: string
  ): Promise<void> {
    try {
      let peerConnection = this.peerConnections.get(fromUserId);

      // For listeners, might need to handle broadcaster's candidates differently
      if (!peerConnection && this.isBroadcaster) {
        peerConnection = this.createPeerConnection(fromUserId);
      }

      if (peerConnection && candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error adding ICE candidate:", error);
    }
  }

  // Create RTCPeerConnection
  private createPeerConnection(peerId: string): RTCPeerConnection {
    let peerConnection = this.peerConnections.get(peerId);

    if (peerConnection) {
      return peerConnection;
    }

    peerConnection = new RTCPeerConnection({
      iceServers: STUN_SERVERS,
    });

    peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        this.socket.emit("webrtc_ice_candidate", {
          streamId: this.streamId,
          candidate: event.candidate,
          userId: this.isBroadcaster ? undefined : peerId,
        });
      }
    };

    peerConnection.ontrack = (event: RTCTrackEvent) => {
      console.log("Remote track received:", event.track.kind);
      if (this.onRemoteStream && event.streams[0]) {
        this.onRemoteStream(event.streams[0], peerId);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(
        `Connection state with ${peerId}:`,
        peerConnection.connectionState
      );
      if (
        peerConnection.connectionState === "failed" ||
        peerConnection.connectionState === "disconnected" ||
        peerConnection.connectionState === "closed"
      ) {
        this.closePeerConnection(peerId);
      }
    };

    this.peerConnections.set(peerId, peerConnection);
    return peerConnection;
  }

  // Setup Socket.IO listeners
  private setupSocketListeners(): void {
    // Listener joined - broadcaster creates an offer for them
    this.socket.on("listener_joined", async (data: { listenerId: string; streamId: string }) => {
      if (this.isBroadcaster && data.streamId === this.streamId) {
        console.log("[WebRTC] Listener joined, creating offer for:", data.listenerId);
        try {
          await this.createOfferForListener(data.listenerId);
        } catch (error) {
          console.error("Error creating offer for new listener:", error);
        }
      }
    });

    this.socket.on("webrtc_offer", async (data) => {
      if (!this.isBroadcaster) {
        console.log("[WebRTC] Listener received offer from:", data.userId);
        try {
          await this.handleOffer(data.offer, data.userId);
        } catch (error) {
          console.error("Error handling offer:", error);
        }
      }
    });

    this.socket.on("webrtc_answer", async (data) => {
      if (this.isBroadcaster) {
        console.log(
          "[WebRTC] Broadcaster received answer from:",
          data.listenerId
        );
        try {
          await this.handleAnswer(data.answer, data.listenerId);
        } catch (error) {
          console.error("Error handling answer:", error);
        }
      }
    });

    this.socket.on("webrtc_ice_candidate", async (data) => {
      console.log("[WebRTC] Received ICE candidate from:", data.from);
      try {
        await this.handleIceCandidate(data.candidate, data.from);
      } catch (error) {
        console.error("Error handling ICE candidate:", error);
      }
    });
  }

  // Close peer connection
  private closePeerConnection(peerId: string): void {
    const peerConnection = this.peerConnections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(peerId);
    }
  }

  // Stop broadcasting
  stopBroadcast(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.localStream = null;
    }

    this.peerConnections.forEach((pc) => {
      pc.close();
    });
    this.peerConnections.clear();
  }

  // Set callback for remote stream
  setOnRemoteStream(
    callback: (stream: MediaStream, userId: string) => void
  ): void {
    this.onRemoteStream = callback;
  }

  // Get local stream
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
}
