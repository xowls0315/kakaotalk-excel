"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import LoginButton from "./LoginButton";

export default function Header() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
          <Link
            href="/guide"
            className="text-sm font-medium text-[#2F2F2F] hover:text-[#3FAF8E] transition"
          >
            Guide
          </Link>

          {isAuthenticated && (
            <Link
              href="/dashboard"
              className="text-sm font-medium text-[#2F2F2F] hover:text-[#3FAF8E] transition"
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
