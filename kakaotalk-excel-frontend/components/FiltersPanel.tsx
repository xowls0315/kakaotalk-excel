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
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get unique participants (빈 문자열 제외)
  const participants = useMemo(() => {
    const unique = Array.from(new Set(messages.map((m) => m.sender))).filter(
      (sender) => sender.trim() !== ""
    );
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

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => {
        // 보낸사람, 내용에서 검색
        const senderMatch = m.sender.toLowerCase().includes(query);
        const contentMatch = m.content.toLowerCase().includes(query);
        return senderMatch || contentMatch;
      });
    }

    return filtered;
  }, [
    messages,
    options.excludeSystemMessages,
    dateStart,
    dateEnd,
    selectedParticipants,
    searchQuery,
  ]);

  // Initialize selectedParticipants to all participants when messages are loaded
  useEffect(() => {
    if (participants.length > 0 && selectedParticipants.length === 0) {
      setSelectedParticipants([...participants]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants]);

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

  const handleSelectAllParticipants = (checked: boolean) => {
    if (checked) {
      setSelectedParticipants([...participants]);
    } else {
      setSelectedParticipants([]);
    }
  };

  const allParticipantsSelected = useMemo(() => {
    return (
      participants.length > 0 &&
      selectedParticipants.length === participants.length
    );
  }, [participants, selectedParticipants]);

  // 선택된 컬럼 개수 계산
  const selectedColumnCount = useMemo(() => {
    let count = 0;
    if (options.showDate ?? true) count++;
    if (options.showTime ?? true) count++;
    if (options.showSender ?? true) count++;
    if (options.showType ?? true) count++;
    if (options.showContent ?? true) count++;
    return count;
  }, [options]);

  const handleSelectAllColumns = (checked: boolean) => {
    setOptions({
      showDate: checked,
      showTime: checked,
      showSender: checked,
      showType: checked,
      showContent: checked,
    });
  };

  const allColumnsSelected = useMemo(() => {
    return (
      (options.showDate ?? true) &&
      (options.showTime ?? true) &&
      (options.showSender ?? true) &&
      (options.showType ?? true) &&
      (options.showContent ?? true)
    );
  }, [options]);

  // 개별 컬럼 토글 핸들러 (최소 1개는 선택되어야 함)
  const handleColumnToggle = (
    columnKey:
      | "showDate"
      | "showTime"
      | "showSender"
      | "showType"
      | "showContent",
    checked: boolean
  ) => {
    // 체크 해제하려고 할 때, 선택된 컬럼이 1개만 남았으면 막기
    if (!checked && selectedColumnCount <= 1) {
      return; // 최소 1개는 선택되어야 하므로 변경하지 않음
    }
    setOptions({ [columnKey]: checked });
  };

  const handleExcludeSystemChange = (checked: boolean) => {
    setOptions({ excludeSystemMessages: checked });
  };

  return (
    <div className="rounded-lg border bg-white p-4 sm:p-6">
      <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">
        필터 옵션
      </h3>

      <div className="space-y-3 sm:space-y-4">
        {/* System messages filter and Search - 가로 배치 */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {/* System messages filter */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="exclude-system"
              checked={options.excludeSystemMessages}
              onChange={(e) => handleExcludeSystemChange(e.target.checked)}
              className="custom-checkbox"
            />
            <label
              htmlFor="exclude-system"
              className="ml-2 text-xs text-gray-700 sm:text-sm"
            >
              시스템 메시지 제외
            </label>
          </div>

          {/* Search - 작은 부가기능 */}
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색..."
              className="w-full rounded-md border border-gray-300 px-2.5 py-1.5 pl-9 pr-8 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:px-3 sm:py-1.5 sm:pl-10 sm:pr-9 sm:text-xs"
            />
            <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none sm:left-3"></i>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 sm:right-3"
              >
                <i className="ri-close-line text-xs"></i>
              </button>
            )}
          </div>
        </div>

        {/* Date range filters */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700 sm:text-sm">
            날짜 범위
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:px-3 sm:py-2 sm:text-sm"
            />
            <span className="flex items-center justify-center text-gray-500 sm:px-0">
              ~
            </span>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:px-3 sm:py-2 sm:text-sm"
            />
          </div>
        </div>

        {/* Participant filter and Column visibility options - 가로 배치 */}
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Participant filter */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 sm:text-sm">
              참여자 필터
            </label>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="participant-all"
                  checked={allParticipantsSelected}
                  onChange={(e) =>
                    handleSelectAllParticipants(e.target.checked)
                  }
                  className="custom-checkbox"
                />
                <label
                  htmlFor="participant-all"
                  className="ml-2 text-xs font-semibold text-gray-700 sm:text-sm bg-[#fff2bd]"
                >
                  ALL
                </label>
              </div>
              {participants.map((participant) => (
                <div key={participant} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`participant-${participant}`}
                    checked={selectedParticipants.includes(participant)}
                    onChange={() => handleParticipantToggle(participant)}
                    className="custom-checkbox"
                  />
                  <label
                    htmlFor={`participant-${participant}`}
                    className="ml-2 text-xs text-gray-700 sm:text-sm"
                  >
                    {participant}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Column visibility options */}
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 sm:text-sm">
              출력 컬럼 선택
            </label>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-all-columns"
                  checked={allColumnsSelected}
                  onChange={(e) => handleSelectAllColumns(e.target.checked)}
                  className="custom-checkbox"
                />
                <label
                  htmlFor="show-all-columns"
                  className="ml-2 text-xs font-semibold text-gray-700 sm:text-sm bg-[#fff2bd]"
                >
                  ALL
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-date"
                  checked={options.showDate ?? true}
                  onChange={(e) =>
                    handleColumnToggle("showDate", e.target.checked)
                  }
                  className="custom-checkbox"
                />
                <label
                  htmlFor="show-date"
                  className="ml-2 text-xs text-gray-700 sm:text-sm"
                >
                  날짜
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-time"
                  checked={options.showTime ?? true}
                  onChange={(e) =>
                    handleColumnToggle("showTime", e.target.checked)
                  }
                  className="custom-checkbox"
                />
                <label
                  htmlFor="show-time"
                  className="ml-2 text-xs text-gray-700 sm:text-sm"
                >
                  시간
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-sender"
                  checked={options.showSender ?? true}
                  onChange={(e) =>
                    handleColumnToggle("showSender", e.target.checked)
                  }
                  className="custom-checkbox"
                />
                <label
                  htmlFor="show-sender"
                  className="ml-2 text-xs text-gray-700 sm:text-sm"
                >
                  보낸 사람
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-type"
                  checked={options.showType ?? true}
                  onChange={(e) =>
                    handleColumnToggle("showType", e.target.checked)
                  }
                  className="custom-checkbox"
                />
                <label
                  htmlFor="show-type"
                  className="ml-2 text-xs text-gray-700 sm:text-sm"
                >
                  타입
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="show-content"
                  checked={options.showContent ?? true}
                  onChange={(e) =>
                    handleColumnToggle("showContent", e.target.checked)
                  }
                  className="custom-checkbox"
                />
                <label
                  htmlFor="show-content"
                  className="ml-2 text-xs text-gray-700 sm:text-sm"
                >
                  내용
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Filter summary */}
        <div className="rounded-md bg-gray-50 p-2 text-xs text-gray-600 sm:p-3 sm:text-sm">
          <p>
            표시 중: <strong>{filteredMessages.length}</strong> /{" "}
            {messages.length} 메시지
          </p>
        </div>
      </div>
    </div>
  );
}
