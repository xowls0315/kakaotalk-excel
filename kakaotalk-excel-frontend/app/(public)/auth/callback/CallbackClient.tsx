// app/(public)/auth/callback/CallbackClient.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL } from "@/lib/constants";
import { User } from "@/lib/auth";
import { claimJobs } from "@/lib/api/jobs";

interface BackendLoginResponse {
  success: boolean;
  message?: string;
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    nickname: string;
    email?: string | null;
    provider: string;
  };
}

export default function CallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { checkAuthStatus, setUser, setAccessToken } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // 현재 URL이 백엔드 URL인지 확인
        const currentUrl = window.location.href;
        const currentOrigin = window.location.origin;
        const isBackendUrl =
          currentUrl.includes(API_BASE_URL) || currentOrigin.includes("kakaotalk-excel-backend.onrender.com") || currentOrigin.includes("localhost:3001") || currentOrigin.includes("127.0.0.1:3001");

        // 백엔드 URL인 경우: JSON 응답을 직접 파싱
        if (isBackendUrl) {
          try {
            let jsonData: BackendLoginResponse | null = null;

            // 방법 1: URL에 format=json 파라미터가 있으면 fetch로 요청
            const urlObj = new URL(currentUrl);
            if (urlObj.searchParams.get("format") === "json" || currentUrl.includes("format=json")) {
              const response = await fetch(currentUrl, {
                method: "GET",
                credentials: "include",
              });

              if (response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                  jsonData = await response.json();
                } else {
                  const text = await response.text();
                  try {
                    jsonData = JSON.parse(text) as BackendLoginResponse;
                  } catch {}
                }
              }
            }

            // 방법 2: 현재 페이지의 body에서 JSON 텍스트를 찾아 파싱 시도
            if (!jsonData) {
              const bodyText = document.body.innerText || document.body.textContent || "";
              try {
                const jsonMatch = bodyText.match(/\{[\s\S]*"success"[\s\S]*"accessToken"[\s\S]*\}/);
                if (jsonMatch) {
                  jsonData = JSON.parse(jsonMatch[0]) as BackendLoginResponse;
                }
              } catch {}
            }

            // 방법 3: fetch로 다시 요청 (format=json 없이도 시도)
            if (!jsonData) {
              const response = await fetch(currentUrl, {
                method: "GET",
                credentials: "include",
              });

              if (response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                  jsonData = await response.json();
                } else {
                  const text = await response.text();
                  try {
                    jsonData = JSON.parse(text) as BackendLoginResponse;
                  } catch {}
                }
              }
            }

            // JSON 데이터 처리
            if (jsonData && jsonData.success && jsonData.accessToken) {
              // 1) Access Token 저장
              setAccessToken(jsonData.accessToken);

              // 2) 사용자 정보 저장
              if (jsonData.user) {
                const user: User = {
                  id: String(jsonData.user.id),
                  name: jsonData.user.nickname,
                  email: jsonData.user.email || undefined,
                };
                setUser(user);
              }

              // 3) 게스트 작업 귀속(옵션)
              try {
                await claimJobs();
              } catch {}

              // 4) 프론트로 리다이렉트
              const frontendUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin.replace(":3001", ":3000").replace("kakaotalk-excel-backend.onrender.com", "kakaotalk-excel-frontend.vercel.app");

              window.location.href = frontendUrl;
              return;
            } else {
              // 유효한 JSON이 없어도 프론트로 이동
              const frontendUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin.replace(":3001", ":3000").replace("kakaotalk-excel-backend.onrender.com", "kakaotalk-excel-frontend.vercel.app");

              window.location.href = frontendUrl;
              return;
            }
          } catch {
            const frontendUrl =
              process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin.replace(":3001", ":3000").replace("kakaotalk-excel-backend.onrender.com", "kakaotalk-excel-frontend.vercel.app");

            window.location.href = frontendUrl;
            return;
          }
        }

        // 프론트엔드 URL인 경우: 기존 로직 (code/token 처리)
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const token = searchParams.get("token");

        if (error) {
          router.replace("/");
          return;
        }

        // token 파라미터가 있는 경우 (백엔드에서 리다이렉트)
        if (token) {
          setAccessToken(token);
          await checkAuthStatus();

          try {
            await claimJobs();
          } catch {}

          router.replace("/");
          return;
        }

        // code 파라미터가 있는 경우
        if (code) {
          try {
            const callbackUrl = `${API_BASE_URL}/auth/kakao/callback?code=${code}`;
            const response = await fetch(callbackUrl, {
              method: "GET",
              credentials: "include",
            });

            if (response.ok) {
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const data: BackendLoginResponse = await response.json();

                if (data.success && data.accessToken) {
                  setAccessToken(data.accessToken);

                  if (data.user) {
                    const user: User = {
                      id: String(data.user.id),
                      name: data.user.nickname,
                      email: data.user.email || undefined,
                    };
                    setUser(user);
                  }

                  try {
                    await claimJobs();
                  } catch {}

                  router.replace("/");
                  return;
                }
              }
            }
          } catch {}
        }

        // 기본 처리
        await checkAuthStatus();
        try {
          await claimJobs();
        } catch {}
        router.replace("/");
      } catch {
        router.replace("/");
      }
    };

    handleCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto max-w-2xl py-12 text-center">
      <div className="mb-4 text-4xl">⏳</div>
      <p className="text-lg text-gray-600">로그인 처리 중...</p>
    </div>
  );
}
