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

// Helper to get stored user
const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem("token"),
  isAuthenticated: !!localStorage.getItem("token"),

  login: (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    const user = getStoredUser();

    if (!token) {
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }

    try {
      // Token exists, restore the session
      set({ isAuthenticated: true, token, user });
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ isAuthenticated: false, user: null, token: null });
    }
  },
}));
