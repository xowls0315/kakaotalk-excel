import { create } from "zustand";
import { User, checkAuth, refreshToken } from "@/lib/auth";

/**
 * localStorage 키 상수
 */
const ACCESS_TOKEN_KEY = "accessToken";

// 디버깅: localStorage 키 확인
if (typeof window !== "undefined") {
  console.log("[useAuthStore] ACCESS_TOKEN_KEY:", ACCESS_TOKEN_KEY);
}

/**
 * localStorage에서 accessToken 가져오기 (안전하게)
 */
function getAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    console.log("[getAccessTokenFromStorage] Reading from localStorage:", {
      key: ACCESS_TOKEN_KEY,
      found: !!token,
      tokenLength: token?.length || 0,
    });
    return token;
  } catch (error) {
    console.error(
      "[getAccessTokenFromStorage] ❌ Failed to read accessToken from localStorage:",
      error
    );
    return null;
  }
}

/**
 * localStorage에 accessToken 저장 (안전하게)
 */
function setAccessTokenToStorage(token: string | null): void {
  if (typeof window === "undefined") {
    console.warn("[setAccessTokenToStorage] window is undefined (SSR)");
    return;
  }
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      console.log("[setAccessTokenToStorage] ✅ Token saved to localStorage:", {
        key: ACCESS_TOKEN_KEY,
        tokenLength: token.length,
        tokenPreview: token.substring(0, 20) + "...",
      });
      // 저장 확인
      const saved = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (!saved) {
        console.error("[setAccessTokenToStorage] ❌ Token was not saved!");
      }
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      console.log(
        "[setAccessTokenToStorage] ✅ Token removed from localStorage"
      );
    }
  } catch (error) {
    console.error(
      "[setAccessTokenToStorage] ❌ Failed to write accessToken to localStorage:",
      error
    );
  }
}

/**
 * localStorage에서 accessToken 삭제 (안전하게)
 */
function removeAccessTokenFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to remove accessToken from localStorage:", error);
  }
}

/**
 * 인증 상태 관리 스토어
 *
 * 토큰 저장 방식:
 * - accessToken: localStorage와 메모리(useAuthStore)에 저장 - 새로고침 시에도 유지
 * - refreshToken: HttpOnly 쿠키에 저장 (백엔드에서 설정) - 새로고침 시에도 유지
 *
 * 로그인 유지 메커니즘:
 * 1. 새로고침 시 localStorage에서 accessToken 복원
 * 2. accessToken이 있으면 /auth/me로 사용자 정보 확인
 * 3. accessToken이 없거나 만료되었으면 refreshToken으로 재발급 시도
 * 4. 재발급 성공 시 accessToken을 localStorage와 메모리에 저장하여 로그인 상태 유지
 */
interface AuthState {
  user: User | null;
  accessToken: string | null; // localStorage와 메모리에 저장 (새로고침 시에도 유지)
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuthStatus: () => Promise<void>;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

// 초기화 시 localStorage에서 accessToken 복원
const initialAccessToken = getAccessTokenFromStorage();

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: initialAccessToken, // localStorage에서 복원된 토큰으로 초기화
  isAuthenticated: false,
  isLoading: false,
  /**
   * 인증 상태 확인 및 새로고침 시 토큰 재발급
   *
   * 새로고침 시 복구 로직:
   * 1. /auth/me 호출 시도 (기존 accessToken으로)
   * 2. 401이면 /auth/refresh 호출 (refreshToken 쿠키 사용)
   * 3. 새로운 accessToken 저장
   * 4. 다시 /auth/me 호출하여 사용자 정보 가져오기
   * 5. 로그인 상태로 설정
   *
   * ⚠️ 중요: refreshToken은 HttpOnly 쿠키이므로 credentials: "include" 필요
   */
  checkAuthStatus: async () => {
    set({ isLoading: true });

    try {
      // localStorage에서 accessToken 확인 (메모리에 없을 수 있음)
      let currentToken = useAuthStore.getState().accessToken;
      if (!currentToken) {
        const storedToken = getAccessTokenFromStorage();
        if (storedToken) {
          // localStorage에 토큰이 있으면 메모리에도 복원
          currentToken = storedToken;
          set({ accessToken: storedToken });
          if (process.env.NODE_ENV === "development") {
            console.debug("✅ Access token restored from localStorage");
          }
        }
      }

      // Step 1: accessToken이 있으면 /auth/me로 사용자 정보 확인 시도
      if (currentToken) {
        try {
          const authStatus = await checkAuth();
          if (authStatus.isAuthenticated && authStatus.user) {
            set({
              user: authStatus.user,
              isAuthenticated: true,
              isLoading: false,
            });

            // 로그인 상태 확인 성공 시 플래그 설정
            if (typeof window !== "undefined") {
              sessionStorage.setItem("wasLoggedIn", "true");
              // 로그인 성공 시 세션 만료 알럿 플래그 제거 (다음 만료 시 다시 표시할 수 있도록)
              sessionStorage.removeItem("sessionExpiredAlertShown");
            }

            if (process.env.NODE_ENV === "development") {
              console.debug("✅ Auth status verified with existing token");
            }
            return;
          }
        } catch (error) {
          // 401 에러면 accessToken이 만료된 것이므로 refresh 시도
          if (
            error instanceof Error &&
            "statusCode" in error &&
            (error as { statusCode?: number }).statusCode === 401
          ) {
            if (process.env.NODE_ENV === "development") {
              console.debug("⚠️ Existing token expired, attempting refresh...");
            }
            // Step 2로 진행 (refresh 시도)
          } else {
            // 기타 에러(네트워크 에러 등)는 토큰을 유지하고 조용히 처리
            // 토큰이 유효할 수 있으므로 삭제하지 않음
            if (process.env.NODE_ENV === "development") {
              console.warn(
                "⚠️ /auth/me failed with non-401 error, keeping token"
              );
            }
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }
        }
      }

      // Step 2: accessToken이 없거나 만료되었으면 /auth/refresh 호출
      try {
        if (process.env.NODE_ENV === "development") {
          console.debug("🔄 Attempting to refresh token...");
        }

        const refreshData = await refreshToken();

        if (refreshData.accessToken) {
          // Step 3: 새로운 accessToken을 localStorage와 메모리에 저장
          useAuthStore.getState().setAccessToken(refreshData.accessToken);

          if (process.env.NODE_ENV === "development") {
            console.debug(
              "✅ Access token refreshed and saved to localStorage"
            );
          }

          // Step 4: 다시 /auth/me 호출하여 사용자 정보 가져오기
          try {
            const authStatus = await checkAuth();
            if (authStatus.isAuthenticated && authStatus.user) {
              set({
                user: authStatus.user,
                isAuthenticated: true,
                isLoading: false,
              });

              // 로그인 성공 시 플래그 설정 (다음에 만료 시 알림 표시용)
              if (typeof window !== "undefined") {
                sessionStorage.setItem("wasLoggedIn", "true");
                // 로그인 성공 시 세션 만료 알럿 플래그 제거 (다음 만료 시 다시 표시할 수 있도록)
                sessionStorage.removeItem("sessionExpiredAlertShown");
              }

              if (process.env.NODE_ENV === "development") {
                console.debug("✅ User info retrieved, logged in successfully");
              }
              return;
            }
          } catch {
            // 사용자 정보 가져오기 실패
            // accessToken은 있으므로 일단 로그인 상태로 설정
            if (process.env.NODE_ENV === "development") {
              console.warn("⚠️ Token refreshed but user info fetch failed");
            }
            set({
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        }
      } catch (refreshError) {
        // refreshToken이 없거나 만료된 경우 (401 에러)
        // 또는 크로스 도메인 환경에서 쿠키가 전송되지 않은 경우
        if (refreshError instanceof Error && "statusCode" in refreshError) {
          const statusCode = (refreshError as { statusCode?: number })
            .statusCode;
          if (statusCode === 401) {
            if (process.env.NODE_ENV === "development") {
              console.debug(
                "ℹ️ Refresh token not found or expired - user not logged in"
              );
            }

            // refreshToken 만료 시 재로그인 안내 알럿 표시
            // 이전에 로그인했던 사용자에게만 알림 (처음 방문자는 제외)
            // 세션 동안 한 번만 표시되도록 플래그 확인
            const wasLoggedIn =
              typeof window !== "undefined" &&
              sessionStorage.getItem("wasLoggedIn") === "true";
            const alertAlreadyShown =
              typeof window !== "undefined" &&
              sessionStorage.getItem("sessionExpiredAlertShown") === "true";

            if ((wasLoggedIn || currentToken) && !alertAlreadyShown) {
              // 이전에 로그인했거나 accessToken이 있었던 경우에만 알림
              // 단, 이미 알림을 표시했으면 다시 표시하지 않음
              alert("로그인 세션이 만료되었습니다.\n" + "다시 로그인해주세요.");

              // 알림 표시 플래그 설정 (세션 동안 유지)
              if (typeof window !== "undefined") {
                sessionStorage.setItem("sessionExpiredAlertShown", "true");
                sessionStorage.removeItem("wasLoggedIn");
              }
            }

            // refreshToken이 없거나 만료됨
            // accessToken은 localStorage에 유지 (다음 로그인 시 사용 가능)
            // 메모리 상태만 초기화
            if (process.env.NODE_ENV === "development") {
              console.debug(
                "⚠️ Refresh token expired, but keeping accessToken in localStorage"
              );
            }
            set({
              user: null,
              accessToken: null, // 메모리에서만 제거 (localStorage는 유지)
              isAuthenticated: false,
              isLoading: false,
            });
            return;
          }
        }

        // 네트워크 에러 등 기타 에러는 토큰을 유지하고 조용히 처리
        // refreshToken 요청 실패는 네트워크 문제일 수 있으므로 기존 토큰 유지
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "⚠️ Refresh token failed (network error?), keeping existing token:",
            refreshError
          );
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      // accessToken이 없고 refreshToken도 실패한 경우 (로그인되지 않은 상태)
      // 토큰이 없으므로 삭제할 것도 없음
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      // 예상치 못한 에러 처리 - 토큰은 유지 (네트워크 문제일 수 있음)
      if (process.env.NODE_ENV === "development") {
        console.error(
          "❌ Unexpected error in checkAuthStatus, keeping token:",
          error
        );
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    // 로그인 성공 시 플래그 설정
    if (user && typeof window !== "undefined") {
      sessionStorage.setItem("wasLoggedIn", "true");
      // 로그인 성공 시 세션 만료 알럿 플래그 제거 (다음 만료 시 다시 표시할 수 있도록)
      sessionStorage.removeItem("sessionExpiredAlertShown");
    }
  },
  setAccessToken: (token) => {
    // localStorage와 메모리 모두에 저장
    console.log(
      "[setAccessToken] Called with token:",
      token ? "token exists" : "null"
    );
    setAccessTokenToStorage(token);
    set({ accessToken: token });
    console.log("[setAccessToken] ✅ Token saved to memory and localStorage");
  },
  logout: () => {
    // localStorage와 메모리 모두에서 제거
    removeAccessTokenFromStorage();
    set({ user: null, accessToken: null, isAuthenticated: false });
    // 로그아웃 시 플래그 제거
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("wasLoggedIn");
      sessionStorage.removeItem("sessionExpiredAlertShown");
    }
  },
}));

/**
 * accessToken 가져오기 (localStorage와 메모리 모두 확인)
 * apiClient에서 사용하기 위한 헬퍼 함수
 */
export function getAccessToken(): string | null {
  // 먼저 메모리에서 확인
  const memoryToken = useAuthStore.getState().accessToken;
  if (memoryToken) {
    return memoryToken;
  }

  // 메모리에 없으면 localStorage에서 확인 및 복원
  const storedToken = getAccessTokenFromStorage();
  if (storedToken) {
    // 메모리에도 복원
    useAuthStore.getState().setAccessToken(storedToken);
    return storedToken;
  }

  return null;
}
