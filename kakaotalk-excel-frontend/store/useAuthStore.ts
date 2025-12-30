import { create } from 'zustand';
import { User, checkAuth } from '@/lib/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      const authStatus = await checkAuth();
      set({
        user: authStatus.user,
        isAuthenticated: authStatus.isAuthenticated,
        isLoading: false,
      });
    } catch (error) {
      // Silently handle auth errors - backend might not be available
      // Only log if it's not a network error
      if (error instanceof Error && 'statusCode' in error) {
        const statusCode = (error as { statusCode?: number }).statusCode;
        if (statusCode !== 0) {
          // Only log non-network errors
          console.error('Failed to check auth status:', error);
        }
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));


