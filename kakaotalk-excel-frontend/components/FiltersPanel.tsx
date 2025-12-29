"use client";

import { useConvertStore, Message } from "@/store/useConvertStore";
import { useState, useEffect, useMemo } from "react";

interface FiltersPanelProps {
  messages: Message[];
  onFilteredChange: (filtered: Message[]) => void;
}

export default function FiltersPanel({
  messages,
  onFilteredChange,
}: FiltersPanelProps) {
  const { options, setOptions } = useConvertStore();
  const [dateStart, setDateStart] = useState<string>("");
  const [dateEnd, setDateEnd] = useState<string>("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );

  // Get unique participants
  const participants = useMemo(() => {
    const unique = Array.from(new Set(messages.map((m) => m.sender)));
    return unique.sort();
  }, [messages]);

  // Apply filters
  const filteredMessages = useMemo(() => {
    let filtered = [...messages];

    // Exclude system messages
    if (options.excludeSystemMessages) {
      filtered = filtered.filter((m) => m.type !== "system");
    }

    // Date range filter
    if (dateStart) {
      const startDate = new Date(dateStart);
      filtered = filtered.filter((m) => new Date(m.timestamp) >= startDate);
    }
    if (dateEnd) {
      const endDate = new Date(dateEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((m) => new Date(m.timestamp) <= endDate);
    }

    // Participant filter
    if (selectedParticipants.length > 0) {
      filtered = filtered.filter((m) =>
        selectedParticipants.includes(m.sender)
      );
    }

    return filtered;
  }, [
    messages,
    options.excludeSystemMessages,
    dateStart,
    dateEnd,
    selectedParticipants,
  ]);

  useEffect(() => {
    onFilteredChange(filteredMessages);
  }, [filteredMessages, onFilteredChange]);

  const handleParticipantToggle = (participant: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(participant)
        ? prev.filter((p) => p !== participant)
        : [...prev, participant]
    );
  };

  const handleExcludeSystemChange = (checked: boolean) => {
    setOptions({ excludeSystemMessages: checked });
  };

  return (
    <div className="rounded-lg border bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">필터 옵션</h3>

      <div className="space-y-4">
        {/* System messages filter */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="exclude-system"
            checked={options.excludeSystemMessages}
            onChange={(e) => handleExcludeSystemChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
          />
          <label
            htmlFor="exclude-system"
            className="ml-2 text-sm text-gray-700"
          >
            시스템 메시지 제외
          </label>
        </div>

        {/* Date range filters */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            날짜 범위
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
            <span className="flex items-center text-gray-500">~</span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Participant filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            참여자 필터
          </label>
          <div className="mt-2 max-h-40 space-y-2 overflow-y-auto">
            {participants.map((participant) => (
              <div key={participant} className="flex items-center">
                <input
                  type="checkbox"
                  id={`participant-${participant}`}
                  checked={selectedParticipants.includes(participant)}
                  onChange={() => handleParticipantToggle(participant)}
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <label
                  htmlFor={`participant-${participant}`}
                  className="ml-2 text-sm text-gray-700"
                >
                  {participant}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Filter summary */}
        <div className="rounded-md bg-gray-50 p-3 text-sm text-gray-600">
          <p>
            표시 중: <strong>{filteredMessages.length}</strong> /{" "}
            {messages.length} 메시지
          </p>
        </div>
      </div>
    </div>
  );
}

