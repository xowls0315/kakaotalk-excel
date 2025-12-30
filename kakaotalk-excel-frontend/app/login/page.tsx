"use client";

import Link from "next/link";
import { getLoginUrl } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#FFFEF8] dark:bg-[#0F1411] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#FBE27A] bg-white p-8 text-center
                      dark:border-[#E6C85C] dark:bg-[#161B17]">
        {/* Title */}
        <h1 className="mb-4 text-2xl font-bold text-[#2F2F2F] dark:text-[#E6EDE8]">
          로그인
        </h1>

        <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
          로그인하면 변환 기록을 저장하고
          <br />
          언제든지 다시 다운로드할 수 있어요.
        </p>

        {/* Login CTA */}
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
          "
        >
          카카오로 로그인
        </a>

        {/* Divider */}
        <div className="my-6 flex items-center gap-2">
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#1E2621]" />
          <span className="text-xs text-gray-400">또는</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-[#1E2621]" />
        </div>

        {/* Back */}
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-[#2F2F2F] hover:underline
                     dark:text-gray-400 dark:hover:text-[#E6EDE8]"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

