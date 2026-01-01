import { create } from 'zustand';
import api from '../lib/api';

interface Stream {
    id: string;
    title: string;
    genre?: string;
    description?: string;
    type: 'EXTERNAL' | 'BROWSER';
    isActive: boolean;
    streamUrl?: string;
    user: {
        id: string;
        username: string;
    };
}

interface StreamState {
    streams: Stream[];
    activeStream: Stream | null;
    isLoading: boolean;
    fetchStreams: () => Promise<void>;
    createStream: (data: Partial<Stream>) => Promise<void>;
    startStream: (id: string) => Promise<void>;
    stopStream: (id: string) => Promise<void>;
    setActiveStream: (stream: Stream | null) => void;
}

export const useStreamStore = create<StreamState>((set, get) => ({
    streams: [],
    activeStream: null,
    isLoading: false,

    fetchStreams: async () => {
        set({ isLoading: true });
        try {
            const [activeRes, myRes] = await Promise.allSettled([
                api.get('/streams'),
                api.get('/streams/my')
            ]);

            const activeStreams = activeRes.status === 'fulfilled' ? activeRes.value.data : [];
            const myStreams = myRes.status === 'fulfilled' ? myRes.value.data : [];

            // Merge and deduplicate by ID, prioritizing myStreams for status/metadata
            const streamMap = new Map();
            [...activeStreams, ...myStreams].forEach(s => streamMap.set(s.id, s));

            set({ streams: Array.from(streamMap.values()) });
        } catch (error) {
            console.error('Failed to fetch streams', error);
        } finally {
            set({ isLoading: false });
        }
    },

    createStream: async (data) => {
        try {
            await api.post('/streams', data);
            await get().fetchStreams();
        } catch (error) {
            console.error('Failed to create stream', error);
            throw error;
        }
    },

    startStream: async (id) => {
        await api.patch(`/streams/${id}/start`);
        await get().fetchStreams();
    },

    stopStream: async (id) => {
        await api.patch(`/streams/${id}/stop`);
        await get().fetchStreams();
    },

    setActiveStream: (stream) => {
        set({ activeStream: stream });
    },
}));
