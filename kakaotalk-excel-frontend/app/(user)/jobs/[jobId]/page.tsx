"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getJob, JobDetail } from "@/lib/api/jobs";
import { JOB_STATUS } from "@/lib/constants";
import Link from "next/link";
import JobStatusBadge from "@/components/ui/JobStatusBadge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { getJobStatusConfig } from "@/lib/utils/jobUtils";
import { formatRelativeTime, formatExpirationTime } from "@/lib/utils/jobUtils";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = params.jobId as string;
  const { isLoading } = useProtectedRoute();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);

  useEffect(() => {
    if (!isLoading && jobId) {
      loadJob();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, jobId]);

  const loadJob = async () => {
    try {
      setIsLoadingJob(true);
      const data = await getJob(jobId);
      setJob(data);
    } catch (error) {
      console.error("Failed to load job:", error);
      // 백엔드 없이 실행 시 에러 처리
    } finally {
      setIsLoadingJob(false);
    }
  };

  if (isLoading || isLoadingJob) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <LoadingSpinner message="작업 정보를 불러오는 중..." fullHeight />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <EmptyState
          icon="📭"
          title="작업을 찾을 수 없습니다"
          description="요청하신 작업이 존재하지 않거나 접근 권한이 없습니다."
          action={
            <Link
              href="/dashboard"
              className="inline-block rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-600"
            >
              대시보드로 돌아가기
            </Link>
          }
        />
      </div>
    );
  }

  const statusConfig = getJobStatusConfig(job.status);

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center text-sm text-gray-600 transition hover:text-gray-900"
        >
          <span className="mr-2">←</span>내 기록으로 돌아가기
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              변환 작업 상세
            </h1>
            {job.fileName && (
              <p className="text-lg text-gray-600">{job.fileName}</p>
            )}
          </div>
          <JobStatusBadge status={job.status} size="lg" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 왼쪽: 주요 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 상태 카드 */}
          <div
            className={`rounded-xl border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} p-6`}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="text-3xl">{statusConfig.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">작업 상태</h2>
                <p className="text-sm text-gray-600">
                  {job.status === JOB_STATUS.PROCESSING
                    ? "변환 작업이 진행 중입니다"
                    : job.status === JOB_STATUS.SUCCESS
                    ? "변환이 성공적으로 완료되었습니다"
                    : job.status === JOB_STATUS.EXPIRED
                    ? "파일이 만료되었습니다"
                    : "변환 중 오류가 발생했습니다"}
                </p>
              </div>
            </div>
          </div>

          {/* 기본 정보 */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
              <span>📋</span>
              작업 정보
            </h2>
            <dl className="space-y-4">
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <span>🆔</span>
                  작업 ID
                </dt>
                <dd className="text-right">
                  <span className="text-sm font-mono text-gray-900">
                    {job.id}
                  </span>
                </dd>
              </div>

              {job.roomName && (
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span>💬</span>
                    채팅방 이름
                  </dt>
                  <dd className="text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      {job.roomName}
                    </span>
                  </dd>
                </div>
              )}

              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <span>📅</span>
                  생성일시
                </dt>
                <dd className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {new Date(job.createdAt).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatRelativeTime(job.createdAt)}
                  </div>
                </dd>
              </div>

              {job.completedAt && (
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span>✅</span>
                    완료일시
                  </dt>
                  <dd className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(job.completedAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatRelativeTime(job.completedAt)}
                    </div>
                  </dd>
                </div>
              )}

              {job.expiresAt && (
                <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span>⏰</span>
                    만료일시
                  </dt>
                  <dd className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {new Date(job.expiresAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div
                      className={`text-xs ${
                        new Date(job.expiresAt) < new Date()
                          ? "text-red-600"
                          : "text-gray-500"
                      }`}
                    >
                      {formatExpirationTime(job.expiresAt)}
                    </div>
                  </dd>
                </div>
              )}

              {job.messageCount !== undefined && (
                <div className="flex items-start justify-between pt-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <span>💬</span>
                    처리된 메시지
                  </dt>
                  <dd className="text-lg font-bold text-gray-900">
                    {job.messageCount.toLocaleString()}개
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* 대화 미리보기 */}
          {job.previewMessages && job.previewMessages.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <span>💬</span>
                대화 미리보기
              </h2>
              <div className="space-y-2">
                {job.previewMessages.slice(0, 5).map((message, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {message.sender}
                      </span>
                      <span className="text-gray-500">
                        {new Date(message.timestamp).toLocaleString("ko-KR", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-gray-700">
                      {message.content || "(내용 없음)"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 변환 옵션 */}
          {job.options && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
                <span>⚙️</span>
                변환 옵션
              </h2>
              <dl className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                  <dt className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>
                      {job.options.excludeSystemMessages ? "✅" : "❌"}
                    </span>
                    시스템 메시지 제외
                  </dt>
                  <dd className="text-sm font-semibold text-gray-900">
                    {job.options.excludeSystemMessages ? "예" : "아니오"}
                  </dd>
                </div>

                {job.options.dateStart && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <dt className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span>📆</span>
                      시작 날짜
                    </dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {new Date(job.options.dateStart).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </dd>
                  </div>
                )}

                {job.options.dateEnd && (
                  <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                    <dt className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span>📆</span>
                      종료 날짜
                    </dt>
                    <dd className="text-sm font-semibold text-gray-900">
                      {new Date(job.options.dateEnd).toLocaleDateString(
                        "ko-KR",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </dd>
                  </div>
                )}

                {job.options.selectedParticipants &&
                  job.options.selectedParticipants.length > 0 && (
                    <div className="rounded-lg bg-gray-50 p-4">
                      <dt className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <span>👥</span>
                        선택된 참여자 ({job.options.selectedParticipants.length}
                        명)
                      </dt>
                      <dd>
                        <div className="flex flex-wrap gap-2">
                          {job.options.selectedParticipants.map(
                            (participant, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-800"
                              >
                                {participant}
                              </span>
                            )
                          )}
                        </div>
                      </dd>
                    </div>
                  )}
              </dl>
            </div>
          )}
        </div>

        {/* 오른쪽: 요약 카드 */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* 빠른 액션 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                빠른 작업
              </h3>
              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  목록으로 돌아가기
                </Link>
              </div>
            </div>

            {/* 작업 요약 */}
            <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-sky-50 to-blue-50 p-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                작업 요약
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">상태</span>
                  <span className="font-semibold text-gray-900">
                    {statusConfig.label}
                  </span>
                </div>
                {job.messageCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">메시지 수</span>
                    <span className="font-semibold text-gray-900">
                      {job.messageCount.toLocaleString()}개
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">생성일</span>
                  <span className="font-semibold text-gray-900">
                    {formatRelativeTime(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
