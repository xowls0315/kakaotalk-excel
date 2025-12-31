import { create } from 'zustand';
import { User, checkAuth, refreshToken } from '@/lib/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null; // 메모리에 저장
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null, // 메모리에 저장
  isAuthenticated: false,
  isLoading: false,
  checkAuthStatus: async () => {
    set({ isLoading: true });
    try {
      // accessToken이 없으면 refreshToken으로 갱신 시도
      const currentToken = useAuthStore.getState().accessToken;
      if (!currentToken) {
        try {
          const refreshData = await refreshToken();
          if (refreshData.accessToken) {
            set({ accessToken: refreshData.accessToken });
          }
        } catch (refreshError) {
          // refreshToken이 없거나 만료된 경우 (401 에러)
          // 로그인되지 않은 상태로 처리하고 checkAuth를 시도하지 않음
          if (
            refreshError instanceof Error &&
            "statusCode" in refreshError
          ) {
            const statusCode = (refreshError as { statusCode?: number }).statusCode;
            if (statusCode === 401) {
              // refreshToken이 없거나 만료됨 - 정상적인 상황 (로그인되지 않음)
              set({
                user: null,
                accessToken: null,
                isAuthenticated: false,
                isLoading: false,
              });
              return;
            }
          }
          // 다른 에러는 무시하고 계속 진행 (네트워크 에러 등)
        }
      }

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
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));

/**
 * 메모리에서 accessToken 가져오기
 * apiClient에서 사용하기 위한 헬퍼 함수
 */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}


