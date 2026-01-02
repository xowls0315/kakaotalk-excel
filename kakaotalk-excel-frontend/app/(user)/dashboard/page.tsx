"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import JobListTable from "@/components/JobListTable";
import JobFilterButtons from "@/components/jobs/JobFilterButtons";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getJobs, claimJobs, Job } from "@/lib/api/jobs";
import { useJobStats } from "@/hooks/useJobStats";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const { stats: jobStats, loadStats } = useJobStats();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // URL 쿼리 파라미터에서 status 필터 가져오기
  const statusFilter = searchParams.get("status") as
    | "previewed"
    | "processing"
    | "success"
    | "failed"
    | "expired"
    | null;

  const loadJobs = useCallback(async () => {
    try {
      setIsLoadingJobs(true);
      const data = await getJobs(statusFilter || undefined);
      console.log("Loaded jobs:", data);
      setJobs(data.jobs);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      // 백엔드 없이 실행 시 빈 배열로 처리
      setJobs([]);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // 게스트 작업을 사용자에게 귀속 시도 (있는 경우)
      claimJobs().catch((error) => {
        // claim 실패는 무시하고 계속 진행 (백엔드 에러 등)
        if (process.env.NODE_ENV === "development") {
          console.debug(
            "ℹ️ Failed to claim guest jobs (this is optional):",
            error
          );
        }
      });

      loadStats();
      loadJobs();
    }
  }, [isAuthenticated, isLoading, loadJobs, loadStats]);

  const handleFilterClick = (status: string | null) => {
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }
    const queryString = params.toString();
    router.push(`/dashboard${queryString ? `?${queryString}` : ""}`);
  };

  if (isLoading || isLoadingJobs) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-12">
        <LoadingSpinner message="로딩 중..." />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 sm:py-12">
      <h1 className="mb-6 sm:mb-8 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
        {user?.name ? (
          <>
            <span className="bg-yellow-100 px-1 rounded">{user.name}</span> 님의
            기록
          </>
        ) : (
          "내 변환 기록"
        )}
      </h1>

      {/* 필터 버튼 */}
      <div className="mb-4 sm:mb-6">
        <JobFilterButtons
          stats={jobStats}
          currentFilter={statusFilter}
          onFilterChange={handleFilterClick}
        />
      </div>

      <div className="mb-4 sm:mb-6">
        <JobListTable jobs={jobs} onRefresh={loadJobs} />
      </div>
    </div>
  );
}
