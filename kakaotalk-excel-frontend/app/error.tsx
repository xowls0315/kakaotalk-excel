"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 서비스에 에러 전송 (선택사항)
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="mb-6 text-6xl">⚠️</div>
      <h1 className="mb-4 text-4xl font-bold text-[#2F2F2F]">
        문제가 발생했어요
      </h1>
      <p className="mb-8 text-lg text-gray-600">
        예상치 못한 오류가 발생했습니다.
        <br />
        잠시 후 다시 시도해주세요.
      </p>
      {error.message && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <strong>에러 내용:</strong> {error.message}
        </div>
      )}
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <button
          onClick={reset}
          className="
            rounded-lg
            bg-[#FBE27A]
            px-6 py-3
            text-base
            font-semibold
            text-[#2F2F2F]
            transition
            hover:bg-[#F5D96B]
          "
        >
          다시 시도하기
        </button>
        <Link
          href="/"
          className="
            rounded-lg
            border border-[#3FAF8E]
            bg-white
            px-6 py-3
            text-base
            font-medium
            text-[#2F2F2F]
            transition
            hover:bg-[#EAF7F2]
          "
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}




