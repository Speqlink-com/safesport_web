import { create } from "zustand";
import type { SessionUser } from "./types/session";

interface AuthState {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authInitialized: boolean;
  setSession: (user: SessionUser) => void;
  clearSession: () => void;
  setLoading: (loading: boolean) => void;
  finishInitialization: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authInitialized: false,
  setSession: (user) => set({ user, isAuthenticated: true, isLoading: false, authInitialized: true }),
  clearSession: () => set({ user: null, isAuthenticated: false, isLoading: false, authInitialized: true }),
  setLoading: (isLoading) => set({ isLoading }),
  finishInitialization: () => set({ isLoading: false, authInitialized: true }),
}));

