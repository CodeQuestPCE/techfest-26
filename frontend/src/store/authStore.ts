import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  college?: string;
  referralCode?: string;
  points?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        localStorage.setItem('token', token);
      },
      updateUser: (user) => {
        set({ user });
      },
      logout: () => {
        set({ user: null, token: null });
        localStorage.removeItem('token');
      },
      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
