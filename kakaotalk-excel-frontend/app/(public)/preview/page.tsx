"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PreviewTable from "@/components/PreviewTable";
import FiltersPanel from "@/components/FiltersPanel";
import { useConvertStore, Message } from "@/store/useConvertStore";
import { convertMessagesToExcel, convertMessagesToCSV } from "@/lib/excel";
import { convertMessagesToPDF } from "@/lib/pdf";
import { parseKakaoTalkFile } from "@/lib/kakaotalkParser";

/* -------------------- Page -------------------- */
export default function PreviewPage() {
  const router = useRouter();
  const { setMessages } = useConvertStore();

  const [messages, setMessagesState] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"xlsx" | "csv" | "pdf">(
    "xlsx"
  );

  useEffect(() => {
    const fileContent = sessionStorage.getItem("uploadedFile");
    if (!fileContent) {
      router.push("/upload");
      return;
    }

    const parsed = parseKakaoTalkFile(fileContent);
    setMessagesState(parsed);
    setMessages(parsed);
    setFilteredMessages(parsed);
  }, [router, setMessages]);

  const handleConvert = useCallback(() => {
    if (filteredMessages.length === 0) {
      alert("아직 변환할 대화가 없어요 😢");
      return;
    }

    setIsConverting(true);
    try {
      const fileName =
        sessionStorage.getItem("uploadedFileName") ?? "kakaotalk-converted.txt";

      const baseFileName = fileName.replace(/\.txt$/i, "");

      if (downloadFormat === "xlsx") {
        let excelFileName = baseFileName;
        if (!excelFileName.toLowerCase().endsWith(".xlsx")) {
          excelFileName += ".xlsx";
        }
        convertMessagesToExcel(filteredMessages, excelFileName);
      } else if (downloadFormat === "csv") {
        let csvFileName = baseFileName;
        if (!csvFileName.toLowerCase().endsWith(".csv")) {
          csvFileName += ".csv";
        }
        convertMessagesToCSV(filteredMessages, csvFileName);
      } else if (downloadFormat === "pdf") {
        let pdfFileName = baseFileName;
        if (!pdfFileName.toLowerCase().endsWith(".pdf")) {
          pdfFileName += ".pdf";
        }
        convertMessagesToPDF(filteredMessages, pdfFileName);
      }

      setTimeout(() => router.push("/result"), 500);
    } catch {
      alert("변환 중에 문제가 생겼어요. 다시 시도해주세요 🙏");
    } finally {
      setIsConverting(false);
    }
  }, [filteredMessages, router, downloadFormat]);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-16">
      {/* Title */}
      <h1 className="mb-3 text-center text-2xl font-bold text-[#2F2F2F] sm:mb-4 sm:text-4xl">
        한 번만 더 확인해볼까요?
      </h1>
      <p className="mb-6 text-center text-sm text-gray-600 sm:mb-10 sm:text-base">
        필요한 대화만 골라서 엑셀로 정리할 수 있어요 🙂
      </p>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-3 sm:mb-8 sm:p-4">
        <FiltersPanel
          messages={messages}
          onFilteredChange={setFilteredMessages}
        />
      </div>

      {/* Table */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-2 sm:mb-10 sm:p-4">
        <PreviewTable messages={filteredMessages} />
      </div>

      {/* Format Selection */}
      <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <label className="text-sm font-medium text-gray-700 sm:text-base">
          파일 형식:
        </label>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setDownloadFormat("xlsx")}
            className={`
              rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm
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
              rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm
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
              rounded-lg px-3 py-2 text-xs font-medium transition sm:px-4 sm:text-sm
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

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
        <button
          onClick={() => router.push("/upload")}
          className="
            rounded-full
            border
            border-gray-300
            bg-white
            px-4 py-2.5
            text-sm
            font-medium
            text-gray-700
            transition
            hover:bg-gray-50
            sm:px-6 sm:py-3
            sm:text-base
          "
        >
          ← 파일 다시 고를래요
        </button>

        <button
          onClick={handleConvert}
          disabled={isConverting || filteredMessages.length === 0}
          className="
            rounded-full
            bg-[#FBE27A]
            px-6 py-2.5
            text-sm
            font-semibold
            text-[#2F2F2F]
            transition
            hover:bg-[#F5D96B]
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:px-8 sm:py-3
            sm:text-base
          "
        >
          {isConverting
            ? downloadFormat === "xlsx"
              ? "Excel 만드는 중이에요…"
              : downloadFormat === "csv"
              ? "CSV 만드는 중이에요…"
              : "PDF 만드는 중이에요…"
            : downloadFormat === "xlsx"
            ? "이제 Excel로 받아볼게요 !"
            : downloadFormat === "csv"
            ? "이제 CSV로 받아볼게요 !"
            : "이제 PDF로 받아볼게요 !"}
        </button>
      </div>
    </div>
  );
}
