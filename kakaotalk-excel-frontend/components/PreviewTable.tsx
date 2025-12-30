"use client";

import { useState } from "react";
import { Message, useConvertStore } from "@/store/useConvertStore";

interface PreviewTableProps {
  messages: Message[];
}

const INITIAL_DISPLAY_COUNT = 10;
const LOAD_MORE_COUNT = 5;

export default function PreviewTable({ messages }: PreviewTableProps) {
  const { options } = useConvertStore();
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  const showDate = options.showDate ?? true;
  const showTime = options.showTime ?? true;
  const showSender = options.showSender ?? true;
  const showType = options.showType ?? true;
  const showContent = options.showContent ?? true;

  // 표시할 메시지 결정
  const displayMessages = messages.slice(0, displayCount);
  const hasMore = messages.length > displayCount;
  const remainingCount = messages.length - displayCount;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}. ${month}. ${day}.`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    const ampm = hour < 12 ? "오전" : "오후";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${ampm} ${hour12}:${minute}`;
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      message: "메시지",
      system: "시스템",
      image: "이미지",
      video: "동영상",
    };
    return typeMap[type] || type;
  };

  const truncateContent = (content: string, maxLength: number = 20) => {
    if (content.length <= maxLength) {
      return content;
    }
    return content.slice(0, maxLength) + "...";
  };

  const renderContent = (content: string) => {
    // 마커를 아이콘으로 변환
    if (content.includes("__IMAGE_ICON__")) {
      const parts = content.split("__IMAGE_ICON__");
      const result: React.ReactNode[] = [];

      parts.forEach((part, index) => {
        if (index > 0) {
          // 아이콘 추가
          result.push(
            <i
              key={`icon-${index}`}
              className="ri-image-line inline-block mr-1"
            ></i>
          );
        }
        if (part) {
          result.push(part);
        }
      });

      // 전체 텍스트 길이 확인
      const fullText = parts.join("");
      const truncated = truncateContent(fullText);

      // 잘리지 않은 경우 전체 표시
      if (truncated === fullText) {
        return <span>{result}</span>;
      }

      // 잘린 경우: 아이콘은 유지하고 텍스트만 잘라서 표시
      // 첫 번째 아이콘은 유지하고 나머지 텍스트는 잘라서 표시
      const iconCount = parts.length - 1;
      if (iconCount > 0 && result.length > 0) {
        // 아이콘과 일부 텍스트만 표시
        const textWithoutMarker = fullText.replace(/__IMAGE_ICON__/g, "");
        const truncatedText = truncateContent(textWithoutMarker);
        return (
          <span>
            <i className="ri-image-line inline-block mr-1"></i>
            {truncatedText}
          </span>
        );
      }

      return <span>{result}</span>;
    }

    // 아이콘이 없는 경우
    return truncateContent(content);
  };

  const visibleColumns = [
    showDate,
    showTime,
    showSender,
    showType,
    showContent,
  ].filter(Boolean).length;

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {showDate && (
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                날짜
              </th>
            )}
            {showTime && (
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                시간
              </th>
            )}
            {showSender && (
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                보낸 사람
              </th>
            )}
            {showType && (
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                타입
              </th>
            )}
            {showContent && (
              <th className="px-4 py-3 text-left font-semibold text-gray-900">
                내용
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {displayMessages.length === 0 ? (
            <tr>
              <td
                colSpan={visibleColumns}
                className="px-4 py-8 text-center text-gray-500"
              >
                표시할 메시지가 없습니다
              </td>
            </tr>
          ) : (
            displayMessages.map((msg, index) => {
              const msgId = `${msg.timestamp}-${msg.sender}-${msg.content.slice(
                0,
                20
              )}-${index}`;
              const getRowClassName = () => {
                if (msg.type === "system") return "bg-gray-50 text-gray-500";
                if (msg.type === "image") return "bg-blue-50";
                if (msg.type === "video") return "bg-purple-50";
                return "";
              };
              return (
                <tr key={msgId} className={getRowClassName()}>
                  {showDate && (
                    <td className="px-4 py-3 text-gray-700">
                      {formatDate(msg.timestamp)}
                    </td>
                  )}
                  {showTime && (
                    <td className="px-4 py-3 text-gray-700">
                      {formatTime(msg.timestamp)}
                    </td>
                  )}
                  {showSender && (
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {msg.sender}
                    </td>
                  )}
                  {showType && (
                    <td className="px-4 py-3 text-gray-700">
                      {getTypeLabel(msg.type)}
                    </td>
                  )}
                  {showContent && (
                    <td className="px-4 py-3 text-gray-700">
                      {renderContent(msg.content)}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {/* 더보기/접기 버튼 - 데이터가 10개 이상일 때만 표시 */}
      {messages.length > 0 &&
        messages.length >= INITIAL_DISPLAY_COUNT &&
        (hasMore || displayCount > INITIAL_DISPLAY_COUNT) && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <div className="flex items-center justify-center gap-8">
              {hasMore && (
                <button
                  onClick={() =>
                    setDisplayCount((prev) => prev + LOAD_MORE_COUNT)
                  }
                  className="
                    rounded-lg
                    px-4 py-2
                    text-sm
                    font-medium
                    text-[#3FAF8E]
                    transition
                    hover:bg-[#fff0b0]
                    hover:text-[#2F2F2F]
                  "
                >
                  더보기 ({Math.min(LOAD_MORE_COUNT, remainingCount)}개 더)
                </button>
              )}
              {displayCount > INITIAL_DISPLAY_COUNT && (
                <button
                  onClick={() => setDisplayCount(INITIAL_DISPLAY_COUNT)}
                  className="
                    rounded-lg
                    px-4 py-2
                    text-sm
                    font-medium
                    text-[#3FAF8E]
                    transition
                    hover:bg-[#fff0b0]
                    hover:text-[#2F2F2F]
                  "
                >
                  접기
                </button>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
