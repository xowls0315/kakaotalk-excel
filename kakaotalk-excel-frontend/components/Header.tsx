"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import LoginButton from "./LoginButton";

export default function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // 백엔드 없이 실행 시 인증 체크 건너뛰기
  // const { isAuthenticated, checkAuthStatus, isLoading } = useAuthStore();
  // useEffect(() => {
  //   checkAuthStatus();
  // }, [checkAuthStatus]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-sky-600">
          Talk to Excel
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/guide"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            사용 가이드
          </Link>
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              내 기록
            </Link>
          )}
          <LoginButton />
        </nav>
      </div>
    </header>
  );
}
