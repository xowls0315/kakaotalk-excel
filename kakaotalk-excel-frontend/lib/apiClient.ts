import { API_BASE_URL } from "./constants";
import { getAccessToken, useAuthStore } from "@/store/useAuthStore";

/**
 * 쿠키 전송 문제 진단
 * 로컬 개발 환경에서 크로스 도메인 쿠키 전송 문제를 확인
 */
function checkCookieDomainIssue(): void {
  if (typeof window === "undefined") return;

  const currentOrigin = window.location.origin;
  const apiBaseUrl = API_BASE_URL;

  // 로컬 개발 환경에서 크로스 도메인 문제 확인
  if (
    process.env.NODE_ENV === "development" &&
    currentOrigin.includes("localhost:3000") &&
    apiBaseUrl.includes("onrender.com")
  ) {
    console.warn("⚠️ 크로스 도메인 쿠키 전송 문제 가능성:");
    console.warn(`프론트엔드: ${currentOrigin}`);
    console.warn(`백엔드: ${apiBaseUrl}`);
    console.warn(
      "해결 방법: .env.local에 NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 설정"
    );
    console.warn("또는 백엔드를 localhost:3001에서 실행하세요.");
  }
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export class ApiClientError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
  }
}

/**
 * Fetch wrapper with credentials and error handling
 * Access Token은 메모리에서 가져오고, Refresh Token은 쿠키에서 자동 전송됨
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // 쿠키 전송 문제 진단 (한 번만 실행)
  if (typeof window !== "undefined") {
    const windowWithFlag = window as Window & { __cookieCheckDone?: boolean };
    if (!windowWithFlag.__cookieCheckDone) {
      checkCookieDomainIssue();
      windowWithFlag.__cookieCheckDone = true;
    }
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  // 메모리에서 accessToken 가져오기
  const accessToken = getAccessToken();

  // 헤더 준비
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // accessToken이 있으면 Authorization 헤더에 추가
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // Include cookies (Refresh Token 자동 전송)
      headers,
    });

    // 401 Unauthorized 처리 - refreshToken으로 accessToken 갱신 시도
    // 단, /auth/refresh 엔드포인트 자체는 제외 (무한 루프 방지)
    if (
      response.status === 401 &&
      accessToken &&
      !endpoint.includes("/auth/refresh")
    ) {
      try {
        // refreshToken을 사용하여 accessToken 재발급 시도
        // 디버깅: 쿠키 전송 확인
        if (process.env.NODE_ENV === "development") {
          console.log("Attempting to refresh token with cookie...");
          console.log("Refresh URL:", `${API_BASE_URL}/auth/refresh`);
        }

        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include", // HttpOnly Cookie 자동 전송 (SameSite 설정 필요)
          headers: {
            "Content-Type": "application/json",
          },
        });

        // 디버깅: 응답 상태 확인
        if (process.env.NODE_ENV === "development") {
          console.log("Refresh response status:", refreshResponse.status);
          if (!refreshResponse.ok) {
            const errorText = await refreshResponse.clone().text();
            console.warn("Refresh failed:", errorText);
          }
        }

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.accessToken) {
            // 새로운 accessToken을 메모리에 저장
            useAuthStore.getState().setAccessToken(refreshData.accessToken);
            // 원래 요청을 새로운 토큰으로 재시도
            const retryHeaders: Record<string, string> = {
              "Content-Type": "application/json",
              ...(options.headers as Record<string, string>),
              Authorization: `Bearer ${refreshData.accessToken}`,
            };
            return apiClient<T>(endpoint, {
              ...options,
              headers: retryHeaders,
            });
          }
        } else if (refreshResponse.status === 401) {
          // refreshToken도 만료되었거나 없음 - 조용히 로그인되지 않은 상태로 처리
          // 로그인 페이지로 리다이렉트하지 않음 (사용자가 직접 로그인할 수 있도록)
          useAuthStore.getState().setAccessToken(null);
          useAuthStore.getState().logout();
          // 원래 요청의 401 에러를 그대로 throw (리다이렉트 없이)
          throw new ApiClientError(
            "Session expired. Please log in again.",
            401
          );
        }
      } catch (refreshError) {
        // 네트워크 에러 등
        if (refreshError instanceof ApiClientError) {
          // ApiClientError는 그대로 throw (리다이렉트 없이)
          useAuthStore.getState().setAccessToken(null);
          useAuthStore.getState().logout();
          throw refreshError;
        }
        // 네트워크 에러 등 기타 에러
        console.error("Refresh token failed:", refreshError);
        useAuthStore.getState().setAccessToken(null);
        useAuthStore.getState().logout();
        // 원래 요청의 401 에러를 그대로 throw (리다이렉트 없이)
        throw new ApiClientError("Session expired. Please log in again.", 401);
      }
    }

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new ApiClientError(errorMessage, response.status);
    }

    // Handle empty responses
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response as unknown as T;
  } catch (error) {
    // Handle network errors (connection refused, etc.)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiClientError(
        "Network error: Unable to connect to server",
        0 // Use 0 to indicate network error
      );
    }
    // Re-throw ApiClientError as-is
    if (error instanceof ApiClientError) {
      throw error;
    }
    // Wrap other errors
    throw new ApiClientError(
      error instanceof Error ? error.message : "Unknown error",
      0
    );
  }
}

/**
 * GET request helper
 */
export function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: "GET" });
}

/**
 * POST request helper
 */
export function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request helper
 */
export function apiPut<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request helper
 */
export function apiDelete<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: "DELETE" });
}

/**
 * File upload helper
 */
export async function apiUpload<T>(
  endpoint: string,
  file: File,
  options?: RequestInit
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(url, {
      ...options,
      method: "POST",
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If response is not JSON, use default message
      }
      throw new ApiClientError(errorMessage, response.status);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return response as unknown as T;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiClientError("Network error: Unable to connect to server", 0);
    }
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(
      error instanceof Error ? error.message : "Unknown error",
      0
    );
  }
}
