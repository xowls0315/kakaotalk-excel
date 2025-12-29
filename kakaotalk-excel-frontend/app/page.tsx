"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // 백엔드 없이 실행 시 인증 체크 건너뛰기
  // const { isAuthenticated, checkAuthStatus } = useAuthStore();
  // useEffect(() => {
  //   checkAuthStatus();
  // }, [checkAuthStatus]);

  return (
    <div className="relative overflow-hidden bg-sky-50">
      {/* 배경 장식 */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/60 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-32 h-[28rem] w-[28rem] rounded-full bg-white/50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-white/40 blur-3xl" />

      <div className="container relative mx-auto max-w-6xl py-20">
        {/* Hero Section */}
        <div className="mb-20 text-center">
          <h1 className="mb-6 text-5xl font-extrabold leading-tight text-gray-900">
            카카오톡 대화를
            <br />
            엑셀로 변환하세요
          </h1>

          <p className="mb-10 text-xl leading-relaxed text-gray-600">
            카카오톡에서 내보낸 대화 파일을
            <br />
            간편하게 엑셀 형식으로 변환해보세요.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/upload"
              className="rounded-xl bg-sky-500 px-8 py-3 text-lg font-semibold text-white shadow-sm transition
                         hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-md
                         active:translate-y-0"
            >
              바로 변환하기
            </Link>

            <Link
              href="/guide"
              className="rounded-xl border border-sky-200 bg-white px-8 py-3 text-lg font-medium text-gray-700
                         transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-sm"
            >
              사용 가이드
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              icon: "📤",
              title: "간편한 업로드",
              desc: "카카오톡에서 내보낸 .txt 파일을 드래그 앤 드롭으로 업로드하세요.",
            },
            {
              icon: "🔍",
              title: "스마트 필터링",
              desc: "날짜 범위, 참여자, 시스템 메시지 등 다양한 필터 옵션을 제공합니다.",
            },
            {
              icon: "📊",
              title: "엑셀 변환",
              desc: "엑셀 파일로 대화 내용을 체계적으로 관리하고 분석하세요.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-white p-6 transition-all duration-200
                         hover:-translate-y-1 hover:shadow-md hover:border-sky-200"
            >
              <div className="mb-4 text-4xl">{f.icon}</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                {f.title}
              </h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Login CTA */}
        {!isAuthenticated && (
          <div className="rounded-2xl border border-sky-200 bg-sky-100/60 p-10 text-center">
            <h2 className="mb-4 text-2xl font-bold text-sky-900">
              로그인하면 더 많은 기능을 이용할 수 있어요 ☁️
            </h2>
            <p className="mb-6 text-sky-800">
              변환 기록 저장, 재다운로드, 기본 설정 저장까지 한 번에!
            </p>
            <Link
              href="/upload"
              className="inline-block rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white
                         transition hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-md"
            >
              먼저 변환해보기
            </Link>
          </div>
        )}

        {/* How it works */}
        <div className="mt-24">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            사용 방법
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="text-center">
                <div
                  className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full
                             bg-sky-100 text-xl font-bold text-sky-600
                             transition group-hover:scale-110"
                >
                  {step}
                </div>
                <h4 className="mb-2 font-semibold text-gray-900">
                  {
                    [
                      "대화 내보내기",
                      "파일 업로드",
                      "필터 적용",
                      "엑셀 다운로드",
                    ][step - 1]
                  }
                </h4>
                <p className="text-sm text-gray-600">
                  {
                    [
                      "카카오톡에서 대화를 txt 파일로 내보냅니다",
                      "내보낸 파일을 업로드합니다",
                      "미리보기에서 필터를 적용합니다",
                      "엑셀 파일을 다운로드합니다",
                    ][step - 1]
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
