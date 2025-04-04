import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'super_admin';
  settings?: {
    passwordUpdate: boolean;
    enableEmailNotification: boolean;
    ccAdminOnEmails: boolean;
    emailTemplate: string;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoading: true,

  setUser: (user: User) => {
    set({ user, isLoading: false });
  },

  setToken: (token: string) => {
    set({ token, isLoading: true });
  },

  fetchUser: async () => {
    const token = get().token;
    if (!token) {
      set({ isLoading: false, user: null });
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/admins/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      set({ user: data, isLoading: false }); // ✅ Ensure `user` is set
    } catch (error) {
      console.error('Error fetching user:', error);
      set({ token: null, user: null, isLoading: false });
    }
  },

  logout: () => {
    set({ token: null, user: null, isLoading: false });
  },
}));
