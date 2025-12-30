"use client";

import { Message } from "@/store/useConvertStore";

interface PreviewTableProps {
  messages: Message[];
}

export default function PreviewTable({ messages }: PreviewTableProps) {
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

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              날짜
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              시간
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              보낸 사람
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              타입
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              내용
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {messages.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                표시할 메시지가 없습니다
              </td>
            </tr>
          ) : (
            messages.map((msg) => {
              const msgId = `${msg.timestamp}-${msg.sender}-${msg.content.slice(
                0,
                20
              )}`;
              const getRowClassName = () => {
                if (msg.type === "system") return "bg-gray-50 text-gray-500";
                if (msg.type === "image") return "bg-blue-50";
                if (msg.type === "video") return "bg-purple-50";
                return "";
              };
              return (
                <tr key={msgId} className={getRowClassName()}>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(msg.timestamp)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatTime(msg.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {msg.sender}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {getTypeLabel(msg.type)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{msg.content}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
