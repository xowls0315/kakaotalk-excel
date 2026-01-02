"use client";

import Link from "next/link";

interface JobStats {
  total: number;
  success: number;
  processing: number;
  failed: number;
  expired: number;
}

interface JobStatsCardsProps {
  stats: JobStats;
  linkBasePath?: string;
  onClick?: (status: string | null) => void;
}

export default function JobStatsCards({
  stats,
  linkBasePath,
  onClick,
}: JobStatsCardsProps) {
  const statItems = [
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

  const getColorClasses = (color: string) => {
    const classes = {
      blue: "bg-blue-50 hover:bg-blue-100",
      green: "bg-green-50 hover:bg-green-100",
      yellow: "bg-yellow-50 hover:bg-yellow-100",
      red: "bg-red-50 hover:bg-red-100",
      gray: "bg-gray-50 hover:bg-gray-100",
    };
    return classes[color as keyof typeof classes];
  };

  const getTextColorClasses = (color: string, type: "number" | "label") => {
    if (type === "number") {
      const classes = {
        blue: "text-blue-600",
        green: "text-green-600",
        yellow: "text-yellow-600",
        red: "text-red-600",
        gray: "text-gray-600",
      };
      return classes[color as keyof typeof classes];
    } else {
      const classes = {
        blue: "text-blue-800",
        green: "text-green-800",
        yellow: "text-yellow-800",
        red: "text-red-800",
        gray: "text-gray-800",
      };
      return classes[color as keyof typeof classes];
    }
  };

  const content = (item: typeof statItems[0]) => (
    <>
      <div className={`text-2xl font-bold ${getTextColorClasses(item.color, "number")}`}>
        {item.count}
      </div>
      <div className={`mt-1 text-xs font-medium ${getTextColorClasses(item.color, "label")}`}>
        {item.label}
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {statItems.map((item) => {
        const className = `rounded-lg p-4 text-center transition cursor-pointer ${getColorClasses(item.color)}`;

        if (onClick) {
          return (
            <button
              key={item.key || "all"}
              onClick={() => onClick(item.key)}
              className={className}
            >
              {content(item)}
            </button>
          );
        }

        if (linkBasePath) {
          const href = item.key
            ? `${linkBasePath}?status=${item.key}`
            : linkBasePath;
          return (
            <Link key={item.key || "all"} href={href} className={className}>
              {content(item)}
            </Link>
          );
        }

        return (
          <div key={item.key || "all"} className={className}>
            {content(item)}
          </div>
        );
      })}
    </div>
  );
}

