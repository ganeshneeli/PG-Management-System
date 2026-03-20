import { create } from "zustand";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

import api from "@/api/axios";

export const useAuthStore = create<AuthState>((set) => {
  // We no longer rely on 'token' in localStorage for security, 
  // but we keep 'user' for immediate UI rendering.
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch (e) {
    localStorage.removeItem("user");
  }

  return {
    token: null, // Token is now in HttpOnly cookie
    user,
    isAuthenticated: !!user, // Simplified check, will be verified by API calls
    setUser: (user) => {
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        localStorage.removeItem("user");
      }
      set({ user, isAuthenticated: !!user });
    },
    setAuth: (_token, user) => {
      // We ignore the token parameter as it's handled by cookies
      localStorage.setItem("user", JSON.stringify(user));
      set({ token: null, user, isAuthenticated: true });
    },
    logout: async () => {
      try {
        await api.post("/auth/logout");
      } catch (e) {
        console.error("Logout API failed", e);
      } finally {
        localStorage.removeItem("user");
        localStorage.removeItem("token"); // Clean up old tokens if any
        set({ token: null, user: null, isAuthenticated: false });
      }
    },
  };
});
