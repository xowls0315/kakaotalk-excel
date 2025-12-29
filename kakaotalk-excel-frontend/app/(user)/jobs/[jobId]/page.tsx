"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { apiGet } from "@/lib/apiClient";
import { downloadFile } from "@/lib/download";
import { JOB_STATUS, JobStatus } from "@/lib/constants";
import Link from "next/link";

interface JobDetail {
  id: string;
  status: JobStatus;
  createdAt: string;
  expiresAt?: string;
  downloadUrl?: string;
  fileName?: string;
  options?: {
    excludeSystemMessages: boolean;
    dateStart?: string;
    dateEnd?: string;
    selectedParticipants?: string[];
  };
  messageCount?: number;
}

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    if (isAuthenticated && jobId) {
      loadJob();
    }
  }, [isAuthenticated, isLoading, jobId, router]);

  const loadJob = async () => {
    try {
      setIsLoadingJob(true);
      const data = await apiGet<JobDetail>(`/jobs/${jobId}`);
      setJob(data);
    } catch (error) {
      console.error("Failed to load job:", error);
      // 백엔드 없이 실행 시 에러 처리
    } finally {
      setIsLoadingJob(false);
    }
  };

  const handleDownload = async () => {
    if (!job?.downloadUrl) return;

    try {
      await downloadFile(
        job.downloadUrl,
        job.fileName || `job-${job.id}.xlsx`
      );
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
        className={`rounded-full px-3 py-1 text-sm font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  if (isLoading || isLoadingJob) {
    return (
      <div className="container mx-auto max-w-4xl py-12 text-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto max-w-4xl py-12 text-center">
        <p className="text-gray-600">작업을 찾을 수 없습니다.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sky-600 hover:text-sky-700 hover:underline"
        >
          대시보드로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
        >
          ← 대시보드로 돌아가기
        </Link>
      </div>

      <h1 className="mb-8 text-4xl font-bold text-gray-900">작업 상세</h1>

      <div className="space-y-6">
        {/* 기본 정보 */}
        <div className="rounded-lg border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">기본 정보</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">상태</dt>
              <dd>{getStatusBadge(job.status)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">생성일</dt>
              <dd className="text-sm text-gray-900">
                {new Date(job.createdAt).toLocaleString("ko-KR")}
              </dd>
            </div>
            {job.expiresAt && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">만료일</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(job.expiresAt).toLocaleString("ko-KR")}
                </dd>
              </div>
            )}
            {job.messageCount && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">메시지 수</dt>
                <dd className="text-sm text-gray-900">{job.messageCount}개</dd>
              </div>
            )}
          </dl>
        </div>

        {/* 변환 옵션 */}
        {job.options && (
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">변환 옵션</h2>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">시스템 메시지 제외</dt>
                <dd className="text-sm text-gray-900">
                  {job.options.excludeSystemMessages ? "예" : "아니오"}
                </dd>
              </div>
              {job.options.dateStart && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">시작 날짜</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(job.options.dateStart).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
              )}
              {job.options.dateEnd && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">종료 날짜</dt>
                  <dd className="text-sm text-gray-900">
                    {new Date(job.options.dateEnd).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
              )}
              {job.options.selectedParticipants && job.options.selectedParticipants.length > 0 && (
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">선택된 참여자</dt>
                  <dd className="text-sm text-gray-900">
                    {job.options.selectedParticipants.join(", ")}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* 다운로드 버튼 */}
        {job.status === JOB_STATUS.SUCCESS && job.downloadUrl && (
          <div className="flex justify-center">
            <button
              onClick={handleDownload}
              className="rounded-xl bg-sky-500 px-8 py-3 font-semibold text-white hover:bg-sky-600"
            >
              엑셀 파일 다운로드
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

