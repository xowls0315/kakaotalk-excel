"use client";

import { useState } from "react";
import { useConvertStore } from "@/store/useConvertStore";
import { updateSettings } from "@/lib/api/settings";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function SettingsPage() {
  const { isLoading } = useProtectedRoute();
  const { options, setOptions } = useConvertStore();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      await updateSettings({
        defaultIncludeSystem: options.excludeSystemMessages,
        defaultSplitSheetsByDay: false, // 필요시 options에서 가져오기
        defaultDateRangeDays: 30, // 필요시 계산
      });
      setSaveMessage("설정이 저장되었습니다.");
      
      // 메시지 3초 후 제거
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <LoadingSpinner message="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <h1 className="mb-8 text-4xl font-bold text-gray-900">설정</h1>

      <div className="space-y-6">
        {/* 기본 변환 옵션 */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            기본 변환 옵션
          </h2>
          <p className="mb-4 text-sm text-gray-600">
            이 설정은 다음 변환 작업의 기본값으로 사용됩니다.
          </p>

          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="default-exclude-system"
                checked={options.excludeSystemMessages}
                onChange={(e) =>
                  setOptions({ excludeSystemMessages: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              />
              <label
                htmlFor="default-exclude-system"
                className="ml-2 text-sm text-gray-700"
              >
                시스템 메시지 제외 (기본값)
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                기본 날짜 범위
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={options.dateStart || ""}
                  onChange={(e) =>
                    setOptions({ dateStart: e.target.value || undefined })
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
                <span className="flex items-center text-gray-500">~</span>
                <input
                  type="date"
                  value={options.dateEnd || ""}
                  onChange={(e) =>
                    setOptions({ dateEnd: e.target.value || undefined })
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "저장 중..." : "설정 저장"}
          </button>
        </div>

        {saveMessage && (
          <div
            className={`rounded-lg border p-4 ${
              saveMessage.includes("오류")
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-green-200 bg-green-50 text-green-800"
            }`}
          >
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}

