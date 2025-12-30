export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://kakaotalk-excel-backend.onrender.com";

export const ROUTES = {
  HOME: "/",
  UPLOAD: "/upload",
  PREVIEW: "/preview",
  RESULT: "/result",
  GUIDE: "/guide",
  DASHBOARD: "/dashboard",
  SETTINGS: "/settings",
  AUTH_CALLBACK: "/auth/callback",
} as const;

export const JOB_STATUS = {
  PROCESSING: "processing",
  SUCCESS: "success",
  EXPIRED: "expired",
  FAILED: "failed",
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];
