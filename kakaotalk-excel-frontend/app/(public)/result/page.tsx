"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { getLoginUrl } from "@/lib/auth";

export default function ResultPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="text-center">
        <div className="mb-6 text-6xl">✅</div>
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          변환이 완료되었습니다!
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          엑셀 파일이 다운로드되었습니다.
          <br />
          다운로드 폴더에서 확인하세요.
        </p>

        {!isAuthenticated && (
          <div className="mb-8 rounded-lg border border-sky-200 bg-sky-50 p-6">
            <h2 className="mb-2 text-lg font-semibold text-sky-900">
              로그인하면 변환 기록을 저장할 수 있어요
            </h2>
            <p className="mb-4 text-sm text-sky-800">
              나중에 다시 다운로드하거나 변환 기록을 확인할 수 있습니다.
            </p>
            <a
              href={getLoginUrl()}
              className="inline-block rounded-xl bg-sky-500 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-600"
            >
              로그인하기
            </a>
          </div>
        )}

        {isAuthenticated && jobId && (
          <div className="mb-8">
            <Link
              href={`/jobs/${jobId}`}
              className="text-sky-600 hover:text-sky-700 hover:underline"
            >
              작업 상세보기 →
            </Link>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/"
            className="text-sky-600 hover:text-sky-700 hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

