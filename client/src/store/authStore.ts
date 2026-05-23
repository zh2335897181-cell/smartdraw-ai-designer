import { create } from 'zustand';
import { User } from '@/lib/types';
import { api } from '@/lib/utils';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('smartdraw-token'),
  isAuthenticated: !!localStorage.getItem('smartdraw-token'),
  isLoading: false,

  setToken: (token: string) => {
    localStorage.setItem('smartdraw-token', token);
    set({ token, isAuthenticated: true });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/auth/login', { email, password });
      localStorage.setItem('smartdraw-token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (username: string, email: string, password: string, displayName?: string) => {
    set({ isLoading: true });
    try {
      const data = await api.post('/auth/register', { username, email, password, displayName });
      localStorage.setItem('smartdraw-token', data.token);
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('smartdraw-token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const user = await api.get('/auth/me');
      set({ user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false, token: null });
      localStorage.removeItem('smartdraw-token');
    }
  },
}));
