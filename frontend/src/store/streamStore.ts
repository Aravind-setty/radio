import { create } from "zustand";
import api from "../lib/api";

interface Stream {
  id: string;
  title: string;
  genre?: string;
  description?: string;
  type: "BROWSER";
  isActive: boolean;
  user: {
    id: string;
    username: string;
  };
}

interface StreamState {
  streams: Stream[];
  activeStream: Stream | null;
  isLoading: boolean;
  myStreamId: string | null; // Track user's own stream
  fetchStreams: () => Promise<void>;
  createStream: (data: Partial<Stream>) => Promise<void>;
  startStream: (id: string) => Promise<void>;
  stopStream: (id: string) => Promise<void>;
  deleteStream: (id: string) => Promise<void>;
  setActiveStream: (stream: Stream | null) => void;
  setMyStreamId: (id: string | null) => void;
}

export const useStreamStore = create<StreamState>((set, get) => ({
  streams: [],
  activeStream: null,
  myStreamId: null,
  isLoading: false,

  fetchStreams: async () => {
    set({ isLoading: true });
    try {
      const [activeRes, myRes] = await Promise.allSettled([
        api.get("/streams"),
        api.get("/streams/my"),
      ]);

      const activeStreams =
        activeRes.status === "fulfilled" ? activeRes.value.data : [];
      const myStreams = myRes.status === "fulfilled" ? myRes.value.data : [];

      // Merge and deduplicate by ID, prioritizing myStreams for status/metadata
      const streamMap = new Map();
      [...activeStreams, ...myStreams].forEach((s: Stream) =>
        streamMap.set(s.id, s)
      );

      set({ streams: Array.from(streamMap.values()) });

      // Set myStreamId if user has an active stream
      const activeUserStream = myStreams.find((s: Stream) => s.isActive);
      set({ myStreamId: activeUserStream?.id || null });
    } catch (error) {
      console.error("Failed to fetch streams", error);
    } finally {
      set({ isLoading: false });
    }
  },

  createStream: async (data) => {
    const state = get();
    // Prevent creating stream if already listening to another
    if (state.activeStream) {
      throw new Error(
        "Stop listening before starting a stream. You can only stream OR listen at a time."
      );
    }
    try {
      const res = await api.post("/streams", data);
      const newStream = res.data;
      set({ myStreamId: newStream.id });
      await get().fetchStreams();
    } catch (error) {
      console.error("Failed to create stream", error);
      throw error;
    }
  },

  startStream: async (id) => {
    const state = get();
    // Prevent starting stream if listening to another
    if (state.activeStream && state.activeStream.id !== id) {
      throw new Error(
        "Stop listening before starting a stream. You can only stream OR listen at a time."
      );
    }
    await api.patch(`/streams/${id}/start`);
    set({ myStreamId: id });
    await get().fetchStreams();
  },

  stopStream: async (id) => {
    await api.patch(`/streams/${id}/stop`);
    set({ myStreamId: null });
    await get().fetchStreams();
  },

  deleteStream: async (id) => {
    const state = get();

    try {
      // Optimistically remove from UI
      set({
        streams: state.streams.filter(s => s.id !== id),
        activeStream: state.activeStream?.id === id ? null : state.activeStream
      });

      // Stop stream if it's active before deleting
      if (state.myStreamId === id) {
        try {
          await api.patch(`/streams/${id}/stop`);
        } catch (error) {
          console.warn('Failed to stop stream before deletion, continuing...', error);
        }
        set({ myStreamId: null });
      }

      // Delete the stream
      await api.delete(`/streams/${id}`);

      // Refresh to ensure consistency
      await get().fetchStreams();
    } catch (error) {
      console.error('Failed to delete stream', error);
      // Revert optimistic update on error
      await get().fetchStreams();
      throw error;
    }
  },

  setActiveStream: (stream) => {
    const state = get();
    // Prevent listening if already streaming
    if (stream && state.myStreamId && state.myStreamId !== stream.id) {
      console.warn("Cannot listen while streaming. Stop your stream first.");
      return;
    }
    set({ activeStream: stream });
  },

  setMyStreamId: (id) => {
    set({ myStreamId: id });
  },
}));
