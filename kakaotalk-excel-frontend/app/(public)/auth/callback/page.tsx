"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      // OAuth 콜백 처리
      const code = searchParams.get("code");
      const error = searchParams.get("error");

      if (error) {
        console.error("Auth error:", error);
        router.push("/");
        return;
      }

      if (code) {
        // 백엔드에서 토큰 교환 및 세션 설정
        // 프론트엔드는 인증 상태만 확인
        await checkAuthStatus();
        router.push("/dashboard");
      } else {
        router.push("/");
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuthStatus]);

  return (
    <div className="container mx-auto max-w-2xl py-12 text-center">
      <div className="mb-4 text-4xl">⏳</div>
      <p className="text-lg text-gray-600">로그인 처리 중...</p>
    </div>
  );
}

