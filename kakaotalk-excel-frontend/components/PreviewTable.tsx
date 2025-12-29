"use client";

import { Message } from "@/store/useConvertStore";

interface PreviewTableProps {
  messages: Message[];
}

export default function PreviewTable({ messages }: PreviewTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              날짜/시간
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              보낸 사람
            </th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">
              내용
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {messages.length === 0 ? (
            <tr>
              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                표시할 메시지가 없습니다
              </td>
            </tr>
          ) : (
            messages.map((msg, idx) => (
              <tr
                key={idx}
                className={
                  msg.type === "system" ? "bg-gray-50 text-gray-500" : ""
                }
              >
                <td className="px-4 py-3 text-gray-700">
                  {new Date(msg.timestamp).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {msg.sender}
                </td>
                <td className="px-4 py-3 text-gray-700">{msg.content}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
