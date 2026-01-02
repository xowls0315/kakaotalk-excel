// app/(public)/auth/callback/page.tsx
import { Suspense } from "react";
import CallbackClient from "./CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackFallback />}>
      <CallbackClient />
    </Suspense>
  );
}

function CallbackFallback() {
  return (
    <div className="container mx-auto max-w-2xl py-12 text-center">
      <div className="mb-4 text-4xl">⏳</div>
      <p className="text-lg text-gray-600">로그인 처리 중...</p>
    </div>
  );
}
