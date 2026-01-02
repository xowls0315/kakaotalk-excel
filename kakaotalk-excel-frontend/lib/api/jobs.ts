import { apiGet, apiPost } from "../apiClient";
import { API_BASE_URL } from "../constants";

export interface Job {
  id: string;
  fileName: string;
  status: "previewed" | "processing" | "success" | "failed" | "expired";
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  messageCount?: number;
  roomName?: string;
}

export interface MessagePreview {
  timestamp: string;
  sender: string;
  content: string;
  type?: "message" | "system" | "image" | "video";
}

export interface JobDetail extends Job {
  expiresAt?: string;
  roomName?: string;
  previewMessages?: MessagePreview[];
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

export interface GetJobsResponse {
  jobs: Job[];
  total: number;
  page: number;
  size: number;
}

/**
 * GET /jobs - 작업 목록 조회
 * @param status - 작업 상태 필터 (previewed, processing, success, failed, expired)
 * @param page - 페이지 번호 (기본값: 1)
 * @param size - 페이지 크기 (기본값: 20)
 */
export async function getJobs(
  status?: "previewed" | "processing" | "success" | "failed" | "expired",
  page?: number,
  size?: number
): Promise<GetJobsResponse> {
  const params = new URLSearchParams();
  if (status) {
    params.append("status", status);
  }
  if (page !== undefined) {
    params.append("page", page.toString());
  }
  if (size !== undefined) {
    params.append("size", size.toString());
  }
  
  const queryString = params.toString();
  const endpoint = queryString ? `/jobs?${queryString}` : "/jobs";
  
  return apiGet<GetJobsResponse>(endpoint);
}

/**
 * GET /jobs/{jobId} - 작업 상세 조회
 */
export async function getJob(jobId: string): Promise<JobDetail> {
  return apiGet<JobDetail>(`/jobs/${jobId}`);
}

/**
 * GET /jobs/{jobId}/download - 작업 파일 재다운로드
 * 파일이 만료되지 않은 경우에만 가능합니다.
 */
export async function downloadJob(jobId: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/download`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      throw new Error("파일이 만료되었거나 존재하지 않습니다.");
    }
    if (response.status === 403) {
      throw new Error("다운로드 권한이 없습니다.");
    }
    if (response.status === 500) {
      throw new Error("서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
    throw new Error(`다운로드에 실패했습니다. (${response.status})`);
  }

  return response.blob();
}

/**
 * POST /jobs/claim - 게스트 작업 귀속
 */
export async function claimJobs(): Promise<ClaimJobsResponse> {
  return apiPost<ClaimJobsResponse>("/jobs/claim");
}

