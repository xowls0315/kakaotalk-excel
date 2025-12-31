"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getLoginUrl } from "@/lib/auth";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, checkAuthStatus } = useAuthStore();

  // 이미 로그인된 상태라면 메인 페이지로 리다이렉트
  // refreshToken이 쿠키에 있으면 자동으로 accessToken 갱신
  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        await checkAuthStatus();
      }
      // 인증 상태 확인 후에도 로그인되어 있으면 메인으로 리다이렉트
      if (isAuthenticated) {
        router.push("/");
      }
    };
    checkAuth();
  }, [isAuthenticated, router, checkAuthStatus]);

  // 이미 로그인된 상태면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFFEF8] dark:bg-[#0F1411] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block mb-4 text-2xl font-bold text-[#2F2F2F] dark:text-[#E6EDE8] hover:text-[#3FAF8E] transition"
          >
            Talk to Excel
          </Link>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#FBE27A] bg-white p-8 text-center dark:border-[#E6C85C] dark:bg-[#161B17] shadow-lg">
          {/* Benefits */}
          <div className="mb-8 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <i className="ri-save-line text-xl text-[#3FAF8E]"></i>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2F2F2F] dark:text-[#E6EDE8]">
                  변환 기록 저장
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  변환한 파일을 저장해두고 나중에 다시 다운로드할 수 있어요
                  <br />
                  <span className="text-[#3FAF8E]">
                    💾 Excel 파일만 저장됩니다
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <i className="ri-history-line text-xl text-[#3FAF8E]"></i>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2F2F2F] dark:text-[#E6EDE8]">
                  내 기록 관리
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  언제 변환했는지, 어떤 파일인지 한눈에 확인할 수 있어요
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                <i className="ri-shield-check-line text-xl text-[#3FAF8E]"></i>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#2F2F2F] dark:text-[#E6EDE8]">
                  안전한 보관
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  카카오 계정으로 간편하게 로그인하고 안전하게 보관해요
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-2">
            <div className="h-px flex-1 bg-gray-200 dark:bg-[#1E2621]" />
            <span className="text-xs text-gray-400">로그인 방법</span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-[#1E2621]" />
          </div>

          {/* Login Button */}
          <a
            href={getLoginUrl()}
            className="
              block
              w-full
              rounded-lg
              bg-[#FBE27A]
              px-6 py-3
              font-semibold
              text-[#2F2F2F]
              transition
              hover:bg-[#F5D96B]
              dark:bg-[#E6C85C]
              dark:text-[#0F1411]
              dark:hover:bg-[#D9B94F]
              shadow-md
              hover:shadow-lg
            "
          >
            <i className="ri-chat-3-line mr-2 text-lg"></i>
            카카오로 로그인
          </a>

          {/* Info */}
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            로그인 없이도 사용할 수 있어요
          </p>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-[#2F2F2F] hover:underline dark:text-gray-400 dark:hover:text-[#E6EDE8] transition"
          >
            <i className="ri-arrow-left-line mr-1"></i>
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
