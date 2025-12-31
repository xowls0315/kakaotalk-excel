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
 * refreshToken은 쿠키에서 자동으로 전송됨
 * refreshToken이 없거나 만료되면 401 에러 발생
 *
 * 주의: 크로스 도메인 쿠키 전송 문제
 * - 로컬 개발: 프론트엔드(localhost:3000)와 백엔드(localhost:3001)가 다른 포트
 * - 쿠키는 도메인별로 관리되므로, 백엔드가 쿠키를 설정할 때 도메인을 제대로 설정해야 함
 * - 로컬 개발 시 NEXT_PUBLIC_API_BASE_URL=http://localhost:3001로 설정 필요
 */
export async function refreshToken(): Promise<{ accessToken: string }> {
  try {
    // 디버깅: 쿠키 전송 확인
    if (process.env.NODE_ENV === "development") {
      console.log("Attempting to refresh token...");
      console.log(
        "API Base URL:",
        process.env.NEXT_PUBLIC_API_BASE_URL ||
          "https://kakaotalk-excel-backend.onrender.com"
      );
    }

    return await apiPost<{ accessToken: string }>("/auth/refresh");
  } catch (error) {
    // 401 에러는 refreshToken이 없거나 만료된 경우
    if (
      error instanceof Error &&
      "statusCode" in error &&
      (error as { statusCode?: number }).statusCode === 401
    ) {
      // 디버깅: 쿠키 전송 실패 가능성
      if (process.env.NODE_ENV === "development") {
        console.warn("Refresh token not found. Possible causes:");
        console.warn(
          "1. Cookie domain mismatch (frontend and backend on different domains)"
        );
        console.warn("2. Cookie not set properly by backend");
        console.warn("3. CORS configuration issue");
        console.warn(
          "For local development, ensure NEXT_PUBLIC_API_BASE_URL=http://localhost:3001"
        );
      }
      throw error;
    }
    throw error;
  }
}

/**
 * POST /auth/logout - 로그아웃
 */
export async function logout(): Promise<void> {
  await apiPost("/auth/logout");
}

/**
 * Get login URL (redirect to backend OAuth endpoint)
 * 배포 서버: https://kakaotalk-excel-backend.onrender.com/auth/kakao
 */
export function getLoginUrl(): string {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://kakaotalk-excel-backend.onrender.com";
  return `${apiBaseUrl}/auth/kakao`;
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
