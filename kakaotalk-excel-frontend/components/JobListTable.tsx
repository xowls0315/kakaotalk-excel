"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Job } from "@/lib/api/jobs";
import JobStatusBadge from "@/components/ui/JobStatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils/jobUtils";

interface JobListTableProps {
  jobs: Job[];
  onRefresh?: () => void;
}

export default function JobListTable({ jobs, onRefresh }: JobListTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
      <table className="w-full text-xs sm:text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">
              파일명
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 hidden sm:table-cell">
              상태
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900 hidden md:table-cell">
              생성일
            </th>
            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-900">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4">
                <EmptyState
                  title="작업이 없습니다"
                  description="아직 변환한 작업이 없습니다"
                />
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr
                key={job.id}
                className="transition hover:bg-gray-50 cursor-pointer"
                onClick={(e) => {
                  // 버튼이나 링크 클릭 시에는 행 클릭 이벤트 무시
                  const target = e.target as HTMLElement;
                  const isButton =
                    target.tagName === "BUTTON" || target.closest("button");
                  const isLink = target.tagName === "A" || target.closest("a");

                  if (!isButton && !isLink) {
                    router.push(`/jobs/${job.id}`);
                  }
                }}
              >
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <div className="font-medium text-gray-900 text-xs sm:text-sm">
                    {job.roomName || `작업 #${job.id.slice(0, 8)}`}
                  </div>
                  <div className="mt-0.5 sm:mt-1 text-xs text-gray-500">
                    {job.fileName || `작업 #${job.id.slice(0, 8)}`}
                  </div>
                  {/* 모바일에서 상태와 날짜를 파일명 아래에 표시 */}
                  <div className="mt-2 sm:hidden flex flex-wrap items-center gap-2">
                    <JobStatusBadge status={job.status} size="sm" />
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(job.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                  <JobStatusBadge status={job.status} />
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4 text-gray-700 hidden md:table-cell">
                  <div className="text-sm">
                    {new Date(job.createdAt).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatRelativeTime(job.createdAt)}
                  </div>
                </td>
                <td className="px-2 sm:px-4 py-3 sm:py-4">
                  <Link
                    href={`/jobs/${job.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-md bg-sky-50 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-sky-700 transition hover:bg-sky-100 whitespace-nowrap inline-block"
                  >
                    상세보기
                  </Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
