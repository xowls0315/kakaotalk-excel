"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import JobListTable, { Job } from "@/components/JobListTable";
import { apiGet } from "@/lib/apiClient";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
      return;
    }

    if (isAuthenticated) {
      loadJobs();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadJobs = async () => {
    try {
      setIsLoadingJobs(true);
      const data = await apiGet<Job[]>("/jobs");
      setJobs(data);
    } catch (error) {
      console.error("Failed to load jobs:", error);
      // 백엔드 없이 실행 시 빈 배열로 처리
      setJobs([]);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  if (isLoading || isLoadingJobs) {
    return (
      <div className="container mx-auto max-w-6xl py-12 text-center">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl py-12">
      <h1 className="mb-8 text-4xl font-bold text-gray-900">내 변환 기록</h1>

      <div className="mb-6">
        <JobListTable jobs={jobs} onRefresh={loadJobs} />
      </div>

      {jobs.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-gray-600">아직 변환 기록이 없습니다.</p>
          <a
            href="/upload"
            className="mt-4 inline-block rounded-xl bg-sky-500 px-6 py-3 font-semibold text-white hover:bg-sky-600"
          >
            파일 변환하기
          </a>
        </div>
      )}
    </div>
  );
}


