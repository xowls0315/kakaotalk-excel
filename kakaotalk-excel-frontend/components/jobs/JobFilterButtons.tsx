"use client";

interface JobStats {
  total: number;
  success: number;
  processing: number;
  failed: number;
  expired: number;
}

interface JobFilterButtonsProps {
  stats: JobStats;
  currentFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

export default function JobFilterButtons({
  stats,
  currentFilter,
  onFilterChange,
}: JobFilterButtonsProps) {
  const filters = [
    { key: null, label: "전체", count: stats.total, color: "blue" },
    { key: "success", label: "완료", count: stats.success, color: "green" },
    {
      key: "processing",
      label: "처리 중",
      count: stats.processing,
      color: "yellow",
    },
    { key: "failed", label: "실패", count: stats.failed, color: "red" },
    { key: "expired", label: "만료", count: stats.expired, color: "gray" },
  ];

  const getButtonClasses = (color: string, isActive: boolean) => {
    const baseClasses = "rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition";
    const colorClasses = {
      blue: isActive
        ? "bg-blue-600 text-white"
        : "bg-blue-50 text-blue-700 hover:bg-blue-100",
      green: isActive
        ? "bg-green-600 text-white"
        : "bg-green-50 text-green-700 hover:bg-green-100",
      yellow: isActive
        ? "bg-yellow-600 text-white"
        : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
      red: isActive
        ? "bg-red-600 text-white"
        : "bg-red-50 text-red-700 hover:bg-red-100",
      gray: isActive
        ? "bg-gray-600 text-white"
        : "bg-gray-50 text-gray-700 hover:bg-gray-100",
    };

    return `${baseClasses} ${colorClasses[color as keyof typeof colorClasses]}`;
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {filters.map((filter) => (
        <button
          key={filter.key || "all"}
          onClick={() => onFilterChange(filter.key)}
          className={getButtonClasses(filter.color, currentFilter === filter.key)}
        >
          {filter.label} ({filter.count})
        </button>
      ))}
    </div>
  );
}

