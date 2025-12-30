import { apiGet, apiPost } from "../apiClient";
import { API_BASE_URL } from "../constants";

export interface Job {
  id: string;
  fileName: string;
  status: "processing" | "success" | "failed" | "expired";
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  messageCount?: number;
}

export interface JobDetail extends Job {
  expiresAt?: string;
  options?: {
    excludeSystemMessages: boolean;
    dateStart?: string;
    dateEnd?: string;
    selectedParticipants?: string[];
  };
}

export interface ClaimJobsResponse {
  claimed: number;
}

/**
 * GET /jobs - 작업 목록 조회
 */
export async function getJobs(): Promise<Job[]> {
  return apiGet<Job[]>("/jobs");
}

/**
 * GET /jobs/{jobId} - 작업 상세 조회
 */
export async function getJob(jobId: string): Promise<JobDetail> {
  return apiGet<JobDetail>(`/jobs/${jobId}`);
}

/**
 * GET /jobs/{jobId}/download - 작업 파일 재다운로드
 */
export async function downloadJob(jobId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/download`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  return response.blob();
}

/**
 * POST /jobs/claim - 게스트 작업 귀속
 */
export async function claimJobs(): Promise<ClaimJobsResponse> {
  return apiPost<ClaimJobsResponse>("/jobs/claim");
}

