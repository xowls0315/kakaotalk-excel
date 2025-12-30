"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { logout as apiLogout } from "@/lib/auth";

export default function LoginButton() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();

  const handleLogin = () => {
    router.push("/login"); // ✅ 로그인 페이지로 이동
  };

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

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="
          rounded-md
          border border-[#3FAF8E]
          px-4 py-2
          text-sm
          font-medium
          text-[#3FAF8E]
          transition
          hover:bg-[#EAF7F2]
          dark:border-[#4FC3A1]
          dark:text-[#4FC3A1]
          dark:hover:bg-[#1E2621]
        "
      >
        로그아웃
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="
        rounded-md
        bg-[#FBE27A]
        px-4 py-2
        text-sm
        font-semibold
        text-[#2F2F2F]
        transition
        hover:bg-[#F5D96B]
        dark:bg-[#E6C85C]
        dark:text-[#0F1411]
        dark:hover:bg-[#D9B94F]
      "
    >
      Login
    </button>
  );
}
