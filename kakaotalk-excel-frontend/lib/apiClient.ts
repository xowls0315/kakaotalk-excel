import { API_BASE_URL } from "./constants";
import { getAccessToken, useAuthStore } from "@/store/useAuthStore";

/**
 * 쿠키 전송 문제 진단
 * 로컬 개발 환경에서 크로스 도메인 쿠키 전송 문제를 확인
 */
function checkCookieDomainIssue(): void {
  if (typeof window === "undefined") return;

  const windowWithCheck = window as Window & { __cookieCheckDone?: boolean };
  if (windowWithCheck.__cookieCheckDone) return;

  const currentOrigin = window.location.origin;
  const apiBaseUrl = API_BASE_URL;

  // 로컬 개발 환경에서 크로스 도메인 문제 확인 (한 번만)
  // 디버그 레벨로 변경하여 콘솔 노이즈 감소
  if (
    process.env.NODE_ENV === "development" &&
    currentOrigin.includes("localhost:3000") &&
    apiBaseUrl.includes("onrender.com")
  ) {
    console.debug("ℹ️ 크로스 도메인 환경: 로컬 프론트엔드 → 프로덕션 백엔드");
    console.debug("로컬 백엔드를 사용하려면 .env.local에 다음을 추가하세요:");
    console.debug("NEXT_PUBLIC_API_BASE_URL=http://localhost:3001");
    windowWithCheck.__cookieCheckDone = true;
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
 *
 * 주요 기능:
 * 1. 모든 요청에 credentials: "include" 포함 (HttpOnly 쿠키인 refreshToken 자동 전송)
 * 2. 401 에러 시 자동으로 refreshToken으로 accessToken 재발급 후 재시도
 * 3. Access Token은 메모리(useAuthStore)에서 가져오고, Refresh Token은 쿠키에서 자동 전송됨
 *
 * ⚠️ 중요: credentials: "include"는 반드시 필요!
 * refreshToken이 HttpOnly 쿠키로 저장되어 있으므로 자동으로 전송되려면 이 옵션이 필수
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
      credentials: "include", // ⚠️ 필수! HttpOnly 쿠키(refreshToken) 자동 전송
      headers,
    });

    // 401 Unauthorized 처리 - refreshToken으로 accessToken 갱신 시도
    // 단, /auth/refresh 엔드포인트 자체는 제외 (무한 루프 방지)
    // retry 플래그로 이미 재시도한 경우를 방지
    const requestOptions = options as RequestInit & { _retry?: boolean };
    if (
      response.status === 401 &&
      accessToken &&
      !endpoint.includes("/auth/refresh") &&
      !requestOptions._retry
    ) {
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `🔄 [apiClient] 401 error on ${endpoint}, attempting token refresh...`
        );
      }

      try {
        // refreshToken을 사용하여 accessToken 재발급 시도
        const refreshUrl = `${API_BASE_URL}/auth/refresh`;
        const refreshResponse = await fetch(refreshUrl, {
          method: "POST",
          credentials: "include", // HttpOnly Cookie 자동 전송 (SameSite 설정 필요)
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (process.env.NODE_ENV === "development") {
          console.debug(
            `🔄 [apiClient] Refresh response status: ${refreshResponse.status}`
          );
        }

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData.accessToken) {
            // 새로운 accessToken을 메모리에 저장
            useAuthStore.getState().setAccessToken(refreshData.accessToken);

            if (process.env.NODE_ENV === "development") {
              console.debug(
                `✅ [apiClient] Token refreshed, retrying original request...`
              );
            }

            // 원래 요청을 새로운 토큰으로 재시도 (무한 루프 방지를 위해 _retry 플래그 추가)
            const retryHeaders: Record<string, string> = {
              "Content-Type": "application/json",
              ...(options.headers as Record<string, string>),
              Authorization: `Bearer ${refreshData.accessToken}`,
            };
            return apiClient<T>(endpoint, {
              ...options,
              headers: retryHeaders,
              _retry: true, // 재시도 플래그 (무한 루프 방지)
            } as RequestInit & { _retry?: boolean });
          }
        } else if (refreshResponse.status === 401) {
          // refreshToken도 만료되었거나 없음
          // accessToken은 localStorage에 유지 (다음 로그인 시 사용 가능)
          // 메모리 상태만 초기화
          if (process.env.NODE_ENV === "development") {
            console.debug(
              "ℹ️ [apiClient] Refresh token expired, but keeping accessToken in localStorage"
            );
          }

          // 메모리에서만 제거 (localStorage는 유지)
          useAuthStore.getState().setAccessToken(null);
          // logout은 호출하지 않음 (localStorage 토큰 유지)
          useAuthStore.getState().setUser(null);
          
          // 원래 요청의 401 에러를 그대로 throw (리다이렉트 없이)
          throw new ApiClientError(
            "Session expired. Please log in again.",
            401
          );
        }
      } catch (refreshError) {
        // 네트워크 에러 등
        if (refreshError instanceof ApiClientError) {
          // ApiClientError (401 등)는 메모리에서만 제거 (localStorage는 유지)
          if (refreshError.statusCode === 401) {
            useAuthStore.getState().setAccessToken(null);
            useAuthStore.getState().setUser(null);
            // logout은 호출하지 않음 (localStorage 토큰 유지)
          }
          // 401이 아닌 ApiClientError는 토큰 유지하고 throw
          throw refreshError;
        }

        // 네트워크 에러 등 기타 에러 - 토큰은 유지 (일시적 문제일 수 있음)
        if (process.env.NODE_ENV === "development") {
          console.warn("❌ [apiClient] Refresh token failed (network error?), keeping token:", refreshError);
        }

        // 네트워크 에러는 토큰을 유지하고 원래 401 에러를 throw
        // 다음 요청 시 다시 refresh 시도 가능
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
