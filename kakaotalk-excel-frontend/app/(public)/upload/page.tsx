"use client";

import UploadDropzone from "@/components/UploadDropzone";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      {/* Title */}
      <h1 className="mb-4 text-center text-4xl font-bold text-[#2F2F2F]">
        파일 하나만 올려주세요
      </h1>
      <p className="mb-12 text-center text-gray-600">
        카카오톡에서 내보낸 대화 파일이면 충분해요.
      </p>

      {/* Upload Area */}
      <div className="mb-10">
        <UploadDropzone />
      </div>

      {/* File Format Info */}
      <div className="mb-8 rounded-2xl border border-[#FBE27A] bg-[#FFF8D8] p-6">
        <h2 className="mb-3 text-lg font-semibold text-[#2F2F2F]">
          📋 업로드 전에 잠깐만 확인해주세요
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-gray-700">
          <li>
            카카오톡에서 대화를 내보낼 때 <strong>.txt</strong> 형식으로
            저장해주세요
          </li>
          <li>
            파일 크기는 최대 <strong>10MB</strong>까지 가능해요
          </li>
          <li>
            한글이 깨지지 않도록 <strong>UTF-8</strong> 형식을 권장해요
          </li>
        </ul>
      </div>

      {/* Export Guide */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="mb-3 text-lg font-semibold text-[#2F2F2F]">
          💡 혹시 대화 내보내기가 처음이라면
        </h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm text-gray-700">
          <li>카카오톡 앱에서 변환하고 싶은 대화방을 열어요</li>
          <li>대화방 상단의 메뉴(⋮)를 눌러요</li>
          <li>“대화 내보내기”를 선택해요</li>
          <li>
            내보낼 항목에서 <strong>텍스트만</strong> 체크해요
          </li>
          <li>저장만 하면 준비 끝이에요</li>
        </ol>

        <div className="mt-4">
          <Link
            href="/guide"
            className="text-sm font-medium text-[#3FAF8E] hover:underline"
          >
            자세한 방법 →
          </Link>
        </div>
      </div>

      {/* Back */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-[#2F2F2F] hover:underline"
        >
          ← 다시 홈으로
        </Link>
      </div>
    </div>
  );
}
