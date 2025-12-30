"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { getLoginUrl } from "@/lib/auth";
import { useConvertStore } from "@/store/useConvertStore";
import { convertMessagesToExcel, convertMessagesToCSV } from "@/lib/excel";
import { convertMessagesToPDF } from "@/lib/pdf";
import { useMemo, useState } from "react";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const { isAuthenticated } = useAuthStore();
  const { messages, options } = useConvertStore();
  const [downloadFormat, setDownloadFormat] = useState<"xlsx" | "csv" | "pdf">(
    "xlsx"
  );

  // 필터링된 메시지 계산
  const filteredMessages = useMemo(() => {
    let filtered = [...messages];

    // 시스템 메시지 제외
    if (options.excludeSystemMessages) {
      filtered = filtered.filter((m) => m.type !== "system");
    }

    // 날짜 범위 필터
    if (options.dateStart) {
      const startDate = new Date(options.dateStart);
      filtered = filtered.filter((m) => new Date(m.timestamp) >= startDate);
    }
    if (options.dateEnd) {
      const endDate = new Date(options.dateEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((m) => new Date(m.timestamp) <= endDate);
    }

    // 참여자 필터
    if (
      options.selectedParticipants &&
      options.selectedParticipants.length > 0
    ) {
      filtered = filtered.filter((m) =>
        options.selectedParticipants!.includes(m.sender)
      );
    }

    return filtered;
  }, [messages, options]);

  const handleRedownload = () => {
    if (filteredMessages.length === 0) {
      alert("다운로드할 메시지가 없어요 😢");
      return;
    }

    try {
      const baseFileName =
        sessionStorage.getItem("uploadedFileName") ?? "kakaotalk-converted.txt";

      let outputFileName = baseFileName.replace(/\.txt$/i, "");

      if (downloadFormat === "xlsx") {
        if (!outputFileName.toLowerCase().endsWith(".xlsx")) {
          outputFileName += ".xlsx";
        }
        convertMessagesToExcel(filteredMessages, outputFileName);
      } else if (downloadFormat === "csv") {
        if (!outputFileName.toLowerCase().endsWith(".csv")) {
          outputFileName += ".csv";
        }
        convertMessagesToCSV(filteredMessages, outputFileName);
      } else if (downloadFormat === "pdf") {
        if (!outputFileName.toLowerCase().endsWith(".pdf")) {
          outputFileName += ".pdf";
        }
        convertMessagesToPDF(filteredMessages, outputFileName);
      }
    } catch {
      alert("다운로드 중에 문제가 생겼어요. 다시 시도해주세요 🙏");
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12 sm:py-20">
      <div className="text-center">
        {/* Success */}
        <div className="mb-3 text-4xl sm:mb-4 sm:text-5xl">🎉</div>

        <h1 className="mb-3 text-2xl font-bold text-[#2F2F2F] sm:mb-4 sm:text-4xl">
          끝났어요!
        </h1>

        <p className="mb-8 text-sm text-gray-600 sm:mb-10 sm:text-lg">
          {downloadFormat === "xlsx" && (
            <>
              Excel 파일을 잘 만들어두었어요.
              <br />
              다운로드 폴더에서 바로 확인할 수 있어요 🙂
            </>
          )}
          {downloadFormat === "csv" && (
            <>
              CSV 파일을 잘 만들어두었어요.
              <br />
              다운로드 폴더에서 바로 확인할 수 있어요 🙂
            </>
          )}
          {downloadFormat === "pdf" && (
            <>
              PDF 파일을 잘 만들어두었어요.
              <br />
              다운로드 폴더에서 바로 확인할 수 있어요 🙂
            </>
          )}
        </p>

        {/* Format Selection */}
        <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <label className="text-sm font-medium text-gray-700 sm:text-base">
            파일 형식:
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setDownloadFormat("xlsx")}
              className={`
                rounded-lg px-4 py-2 text-sm font-medium transition
                ${
                  downloadFormat === "xlsx"
                    ? "bg-[#FBE27A] text-[#2F2F2F]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              Excel (.xlsx)
            </button>
            <button
              onClick={() => setDownloadFormat("csv")}
              className={`
                rounded-lg px-4 py-2 text-sm font-medium transition
                ${
                  downloadFormat === "csv"
                    ? "bg-[#FBE27A] text-[#2F2F2F]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              CSV (.csv)
            </button>
            <button
              onClick={() => setDownloadFormat("pdf")}
              className={`
                rounded-lg px-4 py-2 text-sm font-medium transition
                ${
                  downloadFormat === "pdf"
                    ? "bg-[#FBE27A] text-[#2F2F2F]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }
              `}
            >
              PDF (.pdf)
            </button>
          </div>
        </div>

        {/* Redownload Button */}
        {filteredMessages.length > 0 && (
          <div className="mb-8">
            <button
              onClick={handleRedownload}
              className="
                inline-block
                rounded-lg
                bg-[#3FAF8E]
                px-6 py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-[#359A7D]
                sm:text-base
              "
            >
              <i className="ri-download-line mr-2"></i>
              {downloadFormat === "xlsx" && "Excel 파일 다시 다운로드"}
              {downloadFormat === "csv" && "CSV 파일 다시 다운로드"}
              {downloadFormat === "pdf" && "PDF 파일 다시 다운로드"}
            </button>
          </div>
        )}

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
