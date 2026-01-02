"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import LoginButton from "./LoginButton";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  // AuthInitializer에서 인증 상태를 확인하므로 여기서는 확인하지 않음

  const handleMyRecordsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#F0F0F0] bg-[#FFFEF8]">
      <div className="container mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4">
        {/* Text Logo */}
        <Link
          href="/"
          className="text-lg font-bold text-[#2F2F2F] tracking-tight"
        >
          Talk to Excel
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-5">
          {!isAuthenticated && (
            <Link
              href="/guide"
              className="text-sm font-medium text-[#2F2F2F] hover:text-[#3FAF8E] transition"
            >
              Guide
            </Link>
          )}

          {isAuthenticated && (
            <Link
              href="/dashboard"
              onClick={handleMyRecordsClick}
              className={`text-sm font-medium transition ${
                pathname === "/dashboard"
                  ? "text-[#3FAF8E] font-semibold"
                  : "text-[#2F2F2F] hover:text-[#3FAF8E]"
              }`}
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
