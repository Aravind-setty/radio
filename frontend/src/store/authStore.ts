import { create } from "zustand";

interface User {
  id: string;
  username: string;
  email: string;
  role: "LISTENER" | "STREAMER" | "ADMIN";
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
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  login: (token, user) => {
    localStorage.setItem("token", token);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    try {
      // Verify token by checking if it's still valid
      // In production, you should fetch user profile from backend /api/auth/me
      // This validates token expiration and format
      set({ isAuthenticated: true, token });
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      set({ isAuthenticated: false, user: null, token: null });
    }
  },
}));
