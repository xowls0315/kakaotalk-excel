"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
const FEATURES = [
  {
    icon: <i className="ri-upload-cloud-2-line"></i>,
    title: "파일 하나만 올리면",
    desc: "카카오톡에서 내보낸 txt 파일을 그대로 올리면 돼요.",
  },
  {
    icon: <i className="ri-filter-3-line"></i>,
    title: "필요한 대화만 골라서",
    desc: "날짜나 참여자 기준으로 메시지를 정리할 수 있어요.",
  },
  {
    icon: <i className="ri-file-excel-2-line"></i>,
    title: "엑셀로 정리 끝",
    desc: "복잡한 대화도 엑셀 표로 한 번에 정리돼요.",
  },
] as const;

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-[#FFFEF8]">
      <div className="container mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-24">
        {/* Hero */}
        <section className="mb-16 text-center sm:mb-24">
          <h1 className="mb-4 text-2xl font-bold leading-tight text-[#2F2F2F] sm:mb-6 sm:text-4xl">
            카톡 대화,
            <br />
            정리하려다{" "}
            <span className="text-flicker-in-glow inline-block text-[#FBE27A]">
              포기
            </span>
            한 적 있죠?
          </h1>

          <p className="mb-8 text-base text-gray-600 sm:mb-10 sm:text-lg">
            회의 기록, 거래 내역, 일정 정리…
            <br />
            이제 복붙 말고 엑셀로 한 번에 정리하세요.
          </p>

          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/upload"
              className="w-full rounded-lg bg-[#FBE27A] px-6 py-3 text-base font-semibold text-[#2F2F2F] transition hover:bg-[#fff0b3] sm:w-auto sm:px-8 sm:text-lg"
            >
              지금 파일 올려보기
            </Link>

            <Link
              href="/guide"
              className="w-full rounded-lg border border-[#3FAF8E] bg-white px-6 py-3 text-base font-medium text-[#2F2F2F] transition hover:bg-[#EAF7F2] sm:w-auto sm:px-8 sm:text-lg"
            >
              처음이라면 사용 방법 보기
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mb-16 grid gap-6 sm:mb-24 sm:gap-8 md:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.title}
              className="bounce-top rounded-2xl border border-gray-100 bg-white p-5 text-center sm:p-6"
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              <div className="mb-3 text-3xl sm:mb-4 flex justify-center items-center">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold text-[#2F2F2F] sm:text-lg">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-600 sm:text-sm">{feature.desc}</p>
            </div>
          ))}
        </section>

        {/* Login CTA */}
        {!isAuthenticated && (
          <section className="mb-16 rounded-2xl border border-[#FBE27A] bg-[#FFF8D8] p-6 text-center sm:mb-24 sm:p-10">
            <h2 className="mb-3 text-lg font-semibold text-[#2F2F2F] sm:mb-4 sm:text-xl">
              로그인은 선택이에요 🙂
            </h2>
            <p className="mb-5 text-sm text-gray-600 sm:mb-6 sm:text-base">
              로그인하면 변환 기록을 저장해두고
              <br />
              나중에 다시 내려받을 수 있어요.
            </p>
            <Link
              href="/upload"
              className="inline-block rounded-lg bg-[#FBE27A] px-6 py-3 text-sm font-semibold text-[#2F2F2F] transition hover:bg-[#fff0b3] sm:text-base"
            >
              일단 한 번 써볼게요
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
