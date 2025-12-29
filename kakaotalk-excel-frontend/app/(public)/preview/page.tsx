"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PreviewTable from "@/components/PreviewTable";
import FiltersPanel from "@/components/FiltersPanel";
import { useConvertStore, Message } from "@/store/useConvertStore";
import { convertMessagesToExcel } from "@/lib/excel";

// 카카오톡 날짜/시간 파싱 함수
function parseKakaoTalkDateTime(dateTimeStr: string): Date {
  // 형식: "2024. 1. 1. 오전 10:00" 또는 "2024. 1. 1. 오후 3:00"
  const match = dateTimeStr.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\.\s*(오전|오후)\s*(\d{1,2}):(\d{2})/);
  if (!match) {
    return new Date();
  }

  const [, year, month, day, ampm, hour, minute] = match;
  let hour24 = parseInt(hour, 10);
  
  if (ampm === "오후" && hour24 !== 12) {
    hour24 += 12;
  } else if (ampm === "오전" && hour24 === 12) {
    hour24 = 0;
  }

  return new Date(
    parseInt(year, 10),
    parseInt(month, 10) - 1,
    parseInt(day, 10),
    hour24,
    parseInt(minute, 10)
  );
}

// 카카오톡 대화 내보내기 파일 파서
function parseKakaoTalkFile(content: string): Message[] {
  const lines = content.split("\n");
  const messages: Message[] = [];
  
  // 시스템 메시지 패턴: "2024. 1. 1. 오전 10:00, 사용자1님이 들어왔습니다."
  const systemMessagePattern = /^(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*(?:오전|오후)\s*\d{1,2}:\d{2}),\s*(.+?)(?:님이|이)(?:들어왔습니다|나갔습니다)\.?$/;
  
  // 일반 메시지 패턴: "[2024. 1. 1. 오전 10:05] 사용자1 : 안녕하세요!"
  const messagePattern = /^\[(\d{4}\.\s*\d{1,2}\.\s*\d{1,2}\.\s*(?:오전|오후)\s*\d{1,2}:\d{2})\]\s*(.+?)\s*:\s*(.+)$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // 헤더 라인 무시
    if (line === "카카오톡 대화 내보내기") {
      continue;
    }
    
    // 시스템 메시지 처리
    const systemMatch = line.match(systemMessagePattern);
    if (systemMatch) {
      const [, dateTimeStr, userName] = systemMatch;
      const timestamp = parseKakaoTalkDateTime(dateTimeStr);
      const action = line.includes("들어왔습니다") ? "들어왔습니다" : "나갔습니다";
      
      messages.push({
        timestamp: timestamp.toISOString(),
        sender: "시스템",
        content: `${userName}님이 ${action}.`,
        type: "system",
      });
      continue;
    }
    
    // 일반 메시지 처리
    const messageMatch = line.match(messagePattern);
    if (messageMatch) {
      const [, dateTimeStr, sender, content] = messageMatch;
      const timestamp = parseKakaoTalkDateTime(dateTimeStr);
      
      messages.push({
        timestamp: timestamp.toISOString(),
        sender: sender.trim(),
        content: content.trim(),
        type: "message",
      });
      continue;
    }
  }
  
  return messages;
}

export default function PreviewPage() {
  const router = useRouter();
  const { options, setMessages } = useConvertStore();
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [isConverting, setIsConverting] = useState(false);

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

  const handleConvert = () => {
    if (filteredMessages.length === 0) {
      alert("변환할 메시지가 없습니다.");
      return;
    }

    setIsConverting(true);
    try {
      // 클라이언트 사이드에서 직접 엑셀 변환
      const fileName = sessionStorage.getItem("uploadedFileName") || "kakaotalk-converted.xlsx";
      const excelFileName = fileName.replace(".txt", ".xlsx");
      
      convertMessagesToExcel(filteredMessages, excelFileName);
      
      // 변환 완료 후 result 페이지로 이동
      setTimeout(() => {
        router.push("/result");
      }, 500);
    } catch (error) {
      console.error("Convert error:", error);
      alert("변환 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">
        미리보기 및 옵션 설정
      </h1>

      <div className="mb-6">
        <FiltersPanel
          messages={messages}
          onFilteredChange={setFilteredMessages}
        />
      </div>

      <div className="mb-6">
        <PreviewTable messages={filteredMessages} />
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => router.push("/upload")}
          className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
        >
          다시 업로드
        </button>
        <button
          onClick={handleConvert}
          disabled={isConverting || filteredMessages.length === 0}
          className="rounded-xl bg-sky-500 px-8 py-3 font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConverting ? "변환 중..." : "엑셀로 변환"}
        </button>
      </div>
    </div>
  );
}

