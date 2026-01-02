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
    // 백엔드 응답은 nickname 필드로 올 수 있으므로 any로 받아서 변환
    const backendUser = await apiGet<any>("/auth/me");
    
    // nickname을 name으로 매핑 (백엔드가 nickname 또는 name 필드로 응답할 수 있음)
    const user: User = {
      id: String(backendUser.id),
      name: backendUser.name || backendUser.nickname || undefined,
      email: backendUser.email || undefined,
    };
    
    if (process.env.NODE_ENV === "development") {
      console.debug("[checkAuth] Backend user response:", backendUser);
      console.debug("[checkAuth] Mapped user:", user);
    }
    
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
 * refreshToken은 HttpOnly 쿠키에서 자동으로 전송됨
 * refreshToken이 없거나 만료되면 401 에러 발생
 *
 * 주의: 크로스 도메인 쿠키 전송 문제
 * - 로컬 개발: 프론트엔드(localhost:3000)와 백엔드(localhost:3001)가 다른 포트
 * - 프로덕션: 프론트엔드와 백엔드가 다른 도메인일 수 있음
 * - 쿠키는 도메인별로 관리되므로, 백엔드가 쿠키를 설정할 때 도메인을 제대로 설정해야 함
 * - 로컬 개발 시 .env.local에 NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 설정 필요
 */
export async function refreshToken(): Promise<{ accessToken: string }> {
  // apiClient를 우회하여 직접 fetch로 호출 (무한 루프 방지)
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://kakaotalk-excel-backend.onrender.com";

  const refreshUrl = `${API_BASE_URL}/auth/refresh`;

  const response = await fetch(refreshUrl, {
    method: "POST",
    credentials: "include", // ⚠️ 필수! HttpOnly 쿠키(refreshToken) 자동 전송
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 401이 아닌 경우에만 디버그 로그 표시 (401은 정상적인 상황)
  if (process.env.NODE_ENV === "development" && response.status !== 401) {
    console.debug(`🔄 [refreshToken] Response status: ${response.status}`);

    if (!response.ok) {
      // 에러 발생 시에만 헤더 확인
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.debug("🔄 [refreshToken] Response headers:", responseHeaders);
    }
  }

  if (!response.ok) {
    // 401 에러는 refreshToken이 없거나 만료된 경우 (로그인되지 않은 상태)
    // 또는 크로스 도메인 환경에서 쿠키가 전송되지 않은 경우
    // 이것은 정상적인 상황이므로 특별한 에러로 처리
    if (response.status === 401) {
      // 개발 모드에서만 상세 디버깅 정보 표시 (디버그 레벨로)
      if (process.env.NODE_ENV === "development") {
        console.debug(
          "ℹ️ [refreshToken] 401 - Refresh token not found or expired (this is normal if not logged in)"
        );

        // 크로스 도메인 환경에서만 추가 정보 표시
        const isCrossDomain =
          typeof window !== "undefined" &&
          window.location.origin !== new URL(API_BASE_URL).origin;

        if (isCrossDomain) {
          console.debug("🔍 Cross-domain request detected:");
          console.debug(
            `   Frontend: ${
              typeof window !== "undefined" ? window.location.origin : "N/A"
            }`
          );
          console.debug(`   Backend: ${API_BASE_URL}`);
          console.debug(
            "   💡 Tip: Use local backend (http://localhost:3001) to avoid cookie issues"
          );
        }
      }

      const error = new Error("Refresh token not found or expired") as Error & {
        statusCode?: number;
      };
      error.statusCode = 401;
      throw error;
    }

    // 기타 에러
    let errorMessage = `Refresh failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // JSON 파싱 실패 시 기본 메시지 사용
    }

    if (process.env.NODE_ENV === "development") {
      console.error(`❌ [refreshToken] Error: ${errorMessage}`);
    }

    const error = new Error(errorMessage) as Error & { statusCode?: number };
    error.statusCode = response.status;
    throw error;
  }

  const data = await response.json();

  if (process.env.NODE_ENV === "development") {
    console.debug("✅ [refreshToken] Token refreshed successfully");
  }

  return data;
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
