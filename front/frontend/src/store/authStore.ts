import { create } from "zustand";
import {
  getMeRequest,
  loginRequest,
  registerRequest,
} from "../api/auth";
import type {
  LoginData,
  RegisterData,
  User,
} from "../types/auth";
import { storage } from "../utils/storage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loadUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!storage.getAccessToken(),
  isLoading: false,

  login: async (data) => {
    set({ isLoading: true });

    try {
      const tokens = await loginRequest(data);

      storage.setTokens(tokens.access, tokens.refresh);

      const user = await getMeRequest();

      set({
        user,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });

    try {
      await registerRequest(data);

      const tokens = await loginRequest({
        username: data.username,
        password: data.password,
      });

      storage.setTokens(tokens.access, tokens.refresh);

      const user = await getMeRequest();

      set({
        user,
        isAuthenticated: true,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  loadUser: async () => {
    const token = storage.getAccessToken();

    if (!token) {
      return;
    }

    set({ isLoading: true });

    try {
      const user = await getMeRequest();

      set({
        user,
        isAuthenticated: true,
      });
    } catch {
      storage.clearTokens();

      set({
        user: null,
        isAuthenticated: false,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    storage.clearTokens();

    set({
      user: null,
      isAuthenticated: false,
    });
  },
}));