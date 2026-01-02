"use client";

import { JOB_STATUS } from "@/lib/constants";
import { getJobStatusConfig } from "@/lib/utils/jobUtils";

interface JobStatusBadgeProps {
  status: string;
  size?: "sm" | "md" | "lg";
}

export default function JobStatusBadge({
  status,
  size = "md",
}: JobStatusBadgeProps) {
  const config = getJobStatusConfig(status as any);
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2 sm:px-3 py-0.5 sm:py-1 text-xs",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <span
      className={`rounded-full font-medium whitespace-nowrap ${config.badgeColor} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}

