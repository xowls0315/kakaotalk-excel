"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { getLoginUrl, getLogoutUrl } from "@/lib/auth";

export default function LoginButton() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  const handleLogout = async () => {
    try {
      await fetch(getLogoutUrl(), {
        method: "POST",
        credentials: "include",
      });
      logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      logout();
    }
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-700">
          {user?.name || user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
    >
      로그인
    </button>
  );
}
