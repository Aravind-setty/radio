import { create } from 'zustand';

interface User {
    id: string;
    username: string;
    email: string;
    role: 'LISTENER' | 'STREAMER' | 'ADMIN';
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),

    login: (token, user) => {
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true });
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        // In a real app, you might verify token validity with backend here
        // or decode JWT client-side
        const token = localStorage.getItem('token');
        if (!token) {
            set({ isAuthenticated: false, user: null });
        }
        // Ideally fetch user profile if token exists
    },
}));
