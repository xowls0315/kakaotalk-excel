"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * 앱 초기화 시 인증 상태를 확인하는 컴포넌트
 * 새로고침 시 refreshToken으로 accessToken을 자동 갱신
 * refreshToken이 없으면 조용히 로그인되지 않은 상태로 유지
 */
export default function AuthInitializer() {
  const { checkAuthStatus } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 한 번만 실행되도록 보장
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // accessToken이 없으면 refreshToken으로 갱신 시도
    // refreshToken이 없으면 checkAuthStatus에서 조용히 처리됨
    const { accessToken, isLoading } = useAuthStore.getState();
    if (!accessToken && !isLoading) {
      // refreshToken이 있으면 accessToken을 갱신하고, 없으면 조용히 실패
      checkAuthStatus().catch((error) => {
        // 에러는 checkAuthStatus 내부에서 처리되므로 여기서는 무시
        // refreshToken이 없는 경우는 정상적인 상황 (로그인되지 않음)
      });
    }
  }, [checkAuthStatus]);

  return null; // UI 렌더링 없음
}

