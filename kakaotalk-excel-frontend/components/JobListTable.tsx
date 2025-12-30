"use client";

import Link from "next/link";
import { JOB_STATUS, JobStatus } from "@/lib/constants";
import { downloadFile } from "@/lib/download";

export interface Job {
  id: string;
  status: JobStatus;
  createdAt: string;
  expiresAt?: string;
  downloadUrl?: string;
  fileName?: string;
}

interface JobListTableProps {
  jobs: Job[];
  onRefresh?: () => void;
}

export default function JobListTable({ jobs, onRefresh }: JobListTableProps) {
  const handleDownload = async (job: Job) => {
    if (!job.downloadUrl) return;
    
    try {
      await downloadFile(job.downloadUrl, job.fileName || `job-${job.id}.xlsx`);
    } catch (error) {
      console.error("Download error:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  const getStatusBadge = (status: JobStatus) => {
    const styles = {
      [JOB_STATUS.PROCESSING]: "bg-yellow-100 text-yellow-800",
      [JOB_STATUS.SUCCESS]: "bg-green-100 text-green-800",
      [JOB_STATUS.EXPIRED]: "bg-gray-100 text-gray-800",
      [JOB_STATUS.FAILED]: "bg-red-100 text-red-800",
    };

    const labels = {
      [JOB_STATUS.PROCESSING]: "처리 중",
      [JOB_STATUS.SUCCESS]: "완료",
      [JOB_STATUS.EXPIRED]: "만료됨",
      [JOB_STATUS.FAILED]: "실패",
    };

    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">상태</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">생성일</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">만료일</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-900">작업</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                변환 기록이 없습니다
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id}>
                <td className="px-4 py-3">{getStatusBadge(job.status)}</td>
                <td className="px-4 py-3 text-gray-700">
                  {new Date(job.createdAt).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {job.expiresAt
                    ? new Date(job.expiresAt).toLocaleString("ko-KR")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      상세보기
                    </Link>
                    {job.status === JOB_STATUS.SUCCESS && job.downloadUrl && (
                      <button
                        onClick={() => handleDownload(job)}
                        className="text-sky-600 hover:text-sky-700 hover:underline"
                      >
                        다운로드
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
