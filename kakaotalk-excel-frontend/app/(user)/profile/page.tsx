"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { logout as apiLogout } from "@/lib/auth";
import JobStatsCards from "@/components/jobs/JobStatsCards";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useJobStats } from "@/hooks/useJobStats";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { isAuthenticated, isLoading } = useProtectedRoute();
  const {
    stats: jobStats,
    isLoading: isLoadingStats,
    loadStats,
  } = useJobStats();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated, isLoading, loadStats]);

  const handleLogout = async () => {
    try {
      await apiLogout();
      logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      logout();
      router.push("/");
    }
  };

  if (isLoading || isLoadingStats) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <LoadingSpinner message="정보를 불러오는 중..." fullHeight />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* 헤더 */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center text-sm text-gray-600 transition hover:text-gray-900"
        >
          <span className="mr-2">←</span>내 기록으로 돌아가기
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">내 정보</h1>
      </div>

      <div className="space-y-6">
        {/* 기본 정보 카드 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <span>👤</span>
            기본 정보
          </h2>
          <dl className="space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <span>📝</span>
                닉네임
              </dt>
              <dd className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {user.name || "없음"}
                </span>
              </dd>
            </div>

            {user.email && (
              <div className="flex items-start justify-between pt-4">
                <dt className="flex items-center gap-2 text-sm font-medium text-gray-600">
                  <span>📧</span>
                  이메일
                </dt>
                <dd className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {user.email}
                  </span>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* 작업 통계 카드 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <span>📊</span>
            작업 통계
          </h2>
          <JobStatsCards stats={jobStats} linkBasePath="/dashboard" />
        </div>

        {/* 계정 관리 카드 */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
            <span>⚙️</span>
            계정 관리
          </h2>
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              내 기록 보기
            </Link>
            <button
              onClick={handleLogout}
              className="w-full rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
