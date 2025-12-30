import { apiPost, apiUpload } from "../apiClient";
import { API_BASE_URL } from "../constants";

export interface ConvertExcelRequest {
  messages: Array<{
    timestamp: string;
    sender: string;
    content: string;
    type: "message" | "system" | "image" | "video";
  }>;
  options?: {
    excludeSystemMessages?: boolean;
    showDate?: boolean;
    showTime?: boolean;
    showSender?: boolean;
    showType?: boolean;
    showContent?: boolean;
  };
}

export interface ConvertPreviewRequest {
  file: File;
}

export interface ConvertPreviewResponse {
  messages: Array<{
    timestamp: string;
    sender: string;
    content: string;
    type: "message" | "system" | "image" | "video";
  }>;
}

/**
 * POST /convert/excel - 엑셀 파일 생성 및 다운로드
 */
export async function convertToExcel(
  request: ConvertExcelRequest
): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/convert/excel`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Convert failed with status ${response.status}`
    );
  }

  return response.blob();
}

/**
 * POST /convert/preview - 카카오톡 메시지 미리보기
 */
export async function convertPreview(
  file: File
): Promise<ConvertPreviewResponse> {
  return apiUpload<ConvertPreviewResponse>("/convert/preview", file);
}

