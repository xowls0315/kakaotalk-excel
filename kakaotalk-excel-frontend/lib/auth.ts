import { apiGet, apiPost } from "./apiClient";

export interface User {
  id: string;
  email?: string;
  name?: string;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  user: User | null;
}

/**
 * Check authentication status by calling /auth/me
 */
export async function checkAuth(): Promise<AuthStatus> {
  try {
    const user = await apiGet<User>("/auth/me");
    return {
      isAuthenticated: true,
      user,
    };
  } catch (error) {
    // If 401 or 403, user is not authenticated
    if (error instanceof Error && "statusCode" in error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 401 || statusCode === 403) {
        return {
          isAuthenticated: false,
          user: null,
        };
      }
      // If network error (statusCode 0), treat as unauthenticated (backend not available)
      if (statusCode === 0) {
        return {
          isAuthenticated: false,
          user: null,
        };
      }
    }
    // For other errors, treat as unauthenticated to prevent blocking the UI
    return {
      isAuthenticated: false,
      user: null,
    };
  }
}

/**
 * POST /auth/refresh - Access Token 재발급
 */
export async function refreshToken(): Promise<void> {
  await apiPost("/auth/refresh");
}

/**
 * POST /auth/logout - 로그아웃
 */
export async function logout(): Promise<void> {
  await apiPost("/auth/logout");
}

/**
 * Get login URL (redirect to backend OAuth endpoint)
 * 배포 서버: https://kakaotalk-excel-backend.onrender.com/auth/login
 */
export function getLoginUrl(): string {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://kakaotalk-excel-backend.onrender.com";
  return `${apiBaseUrl}/auth/login`;
}

/**
 * Get logout URL
 * 배포 서버: https://kakaotalk-excel-backend.onrender.com/auth/logout
 */
export function getLogoutUrl(): string {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://kakaotalk-excel-backend.onrender.com";
  return `${apiBaseUrl}/auth/logout`;
}
