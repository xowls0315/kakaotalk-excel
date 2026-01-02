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

export default function AuthCallbackPage() {
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
          currentUrl.includes(API_BASE_URL) ||
          currentOrigin.includes("kakaotalk-excel-backend.onrender.com") ||
          currentOrigin.includes("localhost:3001") ||
          currentOrigin.includes("127.0.0.1:3001");

        // 백엔드 URL인 경우: JSON 응답을 직접 파싱
        if (isBackendUrl) {
          try {
            let jsonData: BackendLoginResponse | null = null;

            // 방법 1: URL에 format=json 파라미터가 있으면 fetch로 요청
            const urlObj = new URL(currentUrl);
            if (
              urlObj.searchParams.get("format") === "json" ||
              currentUrl.includes("format=json")
            ) {
              const response = await fetch(currentUrl, {
                method: "GET",
                credentials: "include",
              });

              if (response.ok) {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                  jsonData = await response.json();
                } else {
                  // JSON이 아닌 경우에도 텍스트로 파싱 시도
                  const text = await response.text();
                  try {
                    jsonData = JSON.parse(text) as BackendLoginResponse;
                  } catch {
                    // 파싱 실패
                  }
                }
              }
            }

            // 방법 2: 현재 페이지의 body에서 JSON 텍스트를 찾아 파싱 시도
            if (!jsonData) {
              const bodyText =
                document.body.innerText || document.body.textContent || "";

              try {
                const jsonMatch = bodyText.match(
                  /\{[\s\S]*"success"[\s\S]*"accessToken"[\s\S]*\}/
                );
                if (jsonMatch) {
                  jsonData = JSON.parse(jsonMatch[0]) as BackendLoginResponse;
                }
              } catch {
                // JSON 파싱 실패
              }
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
                  // JSON이 아닌 경우에도 텍스트로 파싱 시도
                  const text = await response.text();
                  try {
                    jsonData = JSON.parse(text) as BackendLoginResponse;
                  } catch {
                    // 파싱 실패
                  }
                }
              }
            }

            // JSON 데이터 처리
            if (jsonData && jsonData.success && jsonData.accessToken) {
              // 1. Access Token을 localStorage와 메모리에 저장
              setAccessToken(jsonData.accessToken);
              console.log("✅ Access Token saved to localStorage and memory");

              // 2. Refresh Token은 HttpOnly Cookie로 자동 설정됨 (백엔드에서 처리)
              // credentials: "include"로 인해 자동으로 쿠키에 저장됨

              // 3. 사용자 정보 저장
              if (jsonData.user) {
                const user: User = {
                  id: String(jsonData.user.id),
                  name: jsonData.user.nickname,
                  email: jsonData.user.email || undefined,
                };
                setUser(user);
                console.log("✅ User info saved:", user);
              }

              // 4. 게스트 작업을 사용자에게 귀속 (있는 경우)
              try {
                await claimJobs();
                if (process.env.NODE_ENV === "development") {
                  console.debug("✅ Guest jobs claimed successfully");
                }
              } catch (claimError) {
                // claim 실패는 무시하고 계속 진행 (백엔드 에러 등)
                if (process.env.NODE_ENV === "development") {
                  console.debug(
                    "ℹ️ Failed to claim guest jobs (this is optional):",
                    claimError
                  );
                }
              }

              // 5. 프론트엔드 메인 페이지로 리다이렉트
              const frontendUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL ||
                (typeof window !== "undefined"
                  ? window.location.origin
                      .replace(":3001", ":3000")
                      .replace(
                        "kakaotalk-excel-backend.onrender.com",
                        "kakaotalk-excel-frontend.vercel.app"
                      )
                  : "http://localhost:3000");

              console.log("🔄 Redirecting to frontend:", frontendUrl);
              window.location.href = frontendUrl;
              return;
            } else {
              // JSON 데이터가 없거나 유효하지 않은 경우에도 프론트엔드로 리다이렉트
              console.warn(
                "⚠️ No valid JSON data found, redirecting to frontend"
              );
              const frontendUrl =
                process.env.NEXT_PUBLIC_FRONTEND_URL ||
                (typeof window !== "undefined"
                  ? window.location.origin
                      .replace(":3001", ":3000")
                      .replace(
                        "kakaotalk-excel-backend.onrender.com",
                        "kakaotalk-excel-frontend.vercel.app"
                      )
                  : "http://localhost:3000");
              window.location.href = frontendUrl;
              return;
            }
          } catch (fetchError) {
            console.error("Failed to parse callback:", fetchError);
            // JSON 파싱 실패 시에도 프론트엔드로 리다이렉트
            const frontendUrl =
              process.env.NEXT_PUBLIC_FRONTEND_URL ||
              (typeof window !== "undefined"
                ? window.location.origin
                    .replace(":3001", ":3000")
                    .replace(
                      "kakaotalk-excel-backend.onrender.com",
                      "kakaotalk-excel-frontend.vercel.app"
                    )
                : "http://localhost:3000");
            window.location.href = frontendUrl;
            return;
          }
        }

        // 프론트엔드 URL인 경우: 기존 로직 (code 파라미터 처리)
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const token = searchParams.get("token");

        if (error) {
          console.error("Auth error:", error);
          router.push("/");
          return;
        }

        // token 파라미터가 있는 경우 (백엔드에서 리다이렉트)
        if (token) {
          // Access Token을 메모리에 저장
          setAccessToken(token);
          await checkAuthStatus();

          // 게스트 작업을 사용자에게 귀속 (있는 경우)
          try {
            await claimJobs();
            console.log("Guest jobs claimed successfully");
          } catch (claimError) {
            console.warn("Failed to claim guest jobs:", claimError);
            // claim 실패는 무시하고 계속 진행
          }

          router.push("/");
          return;
        }

        // code 파라미터가 있는 경우
        if (code) {
          // 백엔드 콜백 URL로 요청하여 JSON 응답 받기
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
                  // Access Token을 메모리에 저장
                  setAccessToken(data.accessToken);

                  // 사용자 정보 저장
                  if (data.user) {
                    const user: User = {
                      id: String(data.user.id),
                      name: data.user.nickname,
                      email: data.user.email || undefined,
                    };
                    setUser(user);
                  }

                  // 게스트 작업을 사용자에게 귀속 (있는 경우)
                  try {
                    await claimJobs();
                    console.log("Guest jobs claimed successfully");
                  } catch (claimError) {
                    console.warn("Failed to claim guest jobs:", claimError);
                    // claim 실패는 무시하고 계속 진행
                  }

                  // 메인 페이지로 리다이렉트
                  router.push("/");
                  return;
                }
              }
            }
          } catch (error) {
            console.error("Failed to fetch callback:", error);
          }

          // 기본 처리: 인증 상태 확인 후 대시보드로
          await checkAuthStatus();

          // 게스트 작업을 사용자에게 귀속 (있는 경우)
          try {
            await claimJobs();
            console.log("Guest jobs claimed successfully");
          } catch (claimError) {
            console.warn("Failed to claim guest jobs:", claimError);
            // claim 실패는 무시하고 계속 진행
          }

          router.push("/");
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Callback handling error:", error);
        router.push("/");
      }
    };

    handleCallback();
  }, [searchParams, router, checkAuthStatus, setUser]);

  return (
    <div className="container mx-auto max-w-2xl py-12 text-center">
      <div className="mb-4 text-4xl">⏳</div>
      <p className="text-lg text-gray-600">로그인 처리 중...</p>
    </div>
  );
}
