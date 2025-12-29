"use client";

import UploadDropzone from "@/components/UploadDropzone";
import Link from "next/link";

export default function UploadPage() {
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
        파일 업로드
      </h1>

      <div className="mb-8">
        <UploadDropzone />
      </div>

      <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-sky-900">
          📋 파일 포맷 안내
        </h2>
        <ul className="list-disc space-y-2 pl-6 text-sm text-sky-800">
          <li>카카오톡에서 대화를 내보낼 때 .txt 형식으로 저장해주세요</li>
          <li>파일 크기는 최대 10MB까지 지원합니다</li>
          <li>한글 인코딩(UTF-8) 형식의 파일을 권장합니다</li>
        </ul>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          💡 대화 내보내기 방법
        </h2>
        <ol className="list-decimal space-y-2 pl-6 text-sm text-gray-700">
          <li>카카오톡 앱에서 변환하고 싶은 대화방을 엽니다</li>
          <li>대화방 상단의 메뉴(⋮)를 클릭합니다</li>
          <li>"대화 내보내기"를 선택합니다</li>
          <li>내보낼 항목을 선택합니다 (텍스트만 선택 가능)</li>
          <li>저장 위치를 선택하고 저장합니다</li>
        </ol>
        <div className="mt-4">
          <Link
            href="/guide"
            className="text-sm font-medium text-sky-600 hover:text-sky-700 hover:underline"
          >
            자세한 가이드 보기 →
          </Link>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          ← 홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

