import { JOB_STATUS, JobStatus } from "@/lib/constants";
import { Job } from "@/lib/api/jobs";

/**
 * 작업 상태에 따른 상대 시간 포맷팅 (예: "방금 전", "3분 전")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

/**
 * 만료일까지의 상대 시간 (예: "3일 후 만료")
 */
export function formatExpirationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) return "만료됨";
  if (diffDays === 0) return "오늘 만료";
  if (diffDays === 1) return "내일 만료";
  return `${diffDays}일 후 만료`;
}

/**
 * 작업 목록에서 통계 계산
 */
export function calculateJobStats(jobs: Job[]): {
  total: number;
  success: number;
  processing: number;
  failed: number;
  expired: number;
} {
  const stats = {
    total: jobs.length,
    success: 0,
    processing: 0,
    failed: 0,
    expired: 0,
  };

  jobs.forEach((job) => {
    switch (job.status) {
      case "success":
        stats.success++;
        break;
      case "processing":
      case "previewed":
        stats.processing++;
        break;
      case "failed":
        stats.failed++;
        break;
      case "expired":
        stats.expired++;
        break;
    }
  });

  return stats;
}

/**
 * 작업 상태별 스타일 설정
 */
export interface JobStatusConfig {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeColor: string;
  icon: string;
}

export function getJobStatusConfig(status: JobStatus): JobStatusConfig {
  const configs: Record<JobStatus, JobStatusConfig> = {
    [JOB_STATUS.PREVIEWED]: {
      label: "미리보기",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      badgeColor: "bg-blue-100 text-blue-800",
      icon: "👀",
    },
    [JOB_STATUS.PROCESSING]: {
      label: "처리 중",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      badgeColor: "bg-yellow-100 text-yellow-800",
      icon: "⏳",
    },
    [JOB_STATUS.SUCCESS]: {
      label: "완료",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      badgeColor: "bg-green-100 text-green-800",
      icon: "✅",
    },
    [JOB_STATUS.EXPIRED]: {
      label: "만료됨",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-800",
      badgeColor: "bg-gray-100 text-gray-800",
      icon: "⏰",
    },
    [JOB_STATUS.FAILED]: {
      label: "실패",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      badgeColor: "bg-red-100 text-red-800",
      icon: "❌",
    },
  };

  return configs[status];
}

