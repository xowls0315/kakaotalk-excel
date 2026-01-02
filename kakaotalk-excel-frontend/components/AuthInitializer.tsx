"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * 앱 초기화 시 인증 상태를 확인하는 컴포넌트
 * 
 * 주요 기능:
 * 1. 새로고침 시 refreshToken (HttpOnly 쿠키)으로 accessToken 자동 갱신
 * 2. refreshToken이 없거나 만료된 경우 로그인되지 않은 상태로 유지
 * 3. 앱 시작 시 항상 한 번 실행되어 로그인 상태 확인
 * 
 * ⚠️ 중요: refreshToken은 HttpOnly 쿠키로 저장되므로
 * 자바스크립트에서 직접 접근할 수 없고, credentials: "include"로만 전송됨
 */
export default function AuthInitializer() {
  const { checkAuthStatus } = useAuthStore();
  const hasInitialized = useRef(false);

  useEffect(() => {
    // 한 번만 실행되도록 보장 (새로고침 시 다시 실행됨)
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // 앱 시작 시 항상 인증 상태 확인
    // checkAuthStatus 내부에서:
    // 1. accessToken이 없으면 refreshToken으로 재발급 시도
    // 2. refreshToken이 없거나 만료되면 조용히 실패 (로그인되지 않은 상태)
    // 3. accessToken이 있으면 /auth/me로 사용자 정보 확인
    checkAuthStatus().catch((error) => {
      // 에러는 checkAuthStatus 내부에서 처리되므로 여기서는 무시
      // refreshToken이 없는 경우는 정상적인 상황 (로그인되지 않음)
      // 네트워크 에러도 checkAuthStatus에서 처리됨
    });
  }, [checkAuthStatus]);

  return null; // UI 렌더링 없음
}

