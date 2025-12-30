"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { getLoginUrl } from "@/lib/auth";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <div className="text-center">
        {/* Success */}
        <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl">🎉</div>

        <h1 className="mb-3 text-2xl font-bold text-[#2F2F2F] sm:mb-4 sm:text-4xl">
          끝났어요!
        </h1>

        <p className="mb-8 text-sm text-gray-600 sm:mb-10 sm:text-lg">
          엑셀 파일을 잘 만들어두었어요.
          <br />
          다운로드 폴더에서 바로 확인할 수 있어요 🙂
        </p>

        {/* Login CTA */}
        {!isAuthenticated && (
          <div className="mb-8 rounded-2xl border border-[#FBE27A] bg-[#FFF8D8] p-4 sm:mb-10 sm:p-6">
            <h2 className="mb-2 text-base font-semibold text-[#2F2F2F] sm:text-lg">
              로그인은 선택이에요
            </h2>
            <p className="mb-4 text-xs text-gray-700 sm:mb-5 sm:text-sm">
              로그인하면 변환했던 파일을 저장해두고
              <br />
              나중에 다시 받아볼 수 있어요.
            </p>
            <a
              href={getLoginUrl()}
              className="
                inline-block
                rounded-lg
                bg-[#FBE27A]
                px-6 py-3
                text-sm
                font-semibold
                text-[#2F2F2F]
                transition
                hover:bg-[#F5D96B]
              "
            >
              로그인해볼게요
            </a>
          </div>
        )}

        {/* Job link */}
        {isAuthenticated && jobId && (
          <div className="mb-10">
            <Link
              href={`/jobs/${jobId}`}
              className="text-sm font-medium text-[#3FAF8E] hover:underline"
            >
              변환 기록 보러 가기 →
            </Link>
          </div>
        )}

        {/* Back home */}
        <div className="mt-10">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-[#2F2F2F] hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
