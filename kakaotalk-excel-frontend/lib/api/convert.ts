import { apiUpload } from "../apiClient";
import { API_BASE_URL } from "../constants";
import { getAccessToken } from "@/store/useAuthStore";

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

export interface ConvertExcelOptions {
  includeSystem?: boolean;
  splitSheetsByDay?: boolean;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  participants?: string[]; // JSON 배열 문자열로 변환됨
}

/**
 * POST /convert/excel - 엑셀 파일 생성 및 다운로드
 * multipart/form-data 형식으로 파일과 옵션 전송
 */
export async function convertToExcel(
  file: File,
  options?: ConvertExcelOptions
): Promise<Blob> {
  const formData = new FormData();
  formData.append("file", file);

  if (options?.includeSystem !== undefined) {
    formData.append("includeSystem", String(options.includeSystem));
  }
  if (options?.splitSheetsByDay !== undefined) {
    formData.append("splitSheetsByDay", String(options.splitSheetsByDay));
  }
  if (options?.dateFrom) {
    formData.append("dateFrom", options.dateFrom);
  }
  if (options?.dateTo) {
    formData.append("dateTo", options.dateTo);
  }
  if (options?.participants && options.participants.length > 0) {
    formData.append("participants", JSON.stringify(options.participants));
  }

  // Access Token이 있으면 Authorization 헤더에 추가 (메모리에서 가져오기)
  const accessToken = getAccessToken();
  const headers: HeadersInit = {};
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/convert/excel`, {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    });

    // 201 Created 또는 200 OK 모두 성공으로 처리
    if (response.status === 201 || response.status === 200) {
      // Content-Type 확인: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
      const contentType = response.headers.get("content-type");
      if (
        contentType &&
        contentType.includes(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
      ) {
        return await response.blob();
      } else {
        // 예상치 못한 Content-Type인 경우에도 Blob으로 반환 시도
        return await response.blob();
      }
    }

    // 에러 처리: 400, 413 등
    let errorMessage = `Convert failed with status ${response.status}`;
    const clonedResponse = response.clone();
    try {
      const errorData = await clonedResponse.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      try {
        const errorText = await clonedResponse.text();
        errorMessage = errorText || errorMessage;
      } catch {
        // 기본 메시지 사용
      }
    }

    // 상태 코드별 에러 메시지
    if (response.status === 400) {
      throw new Error(
        errorMessage || "잘못된 요청입니다. 파일 형식과 크기를 확인해주세요."
      );
    } else if (response.status === 413) {
      throw new Error(
        errorMessage ||
          "파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다."
      );
    } else {
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        "네트워크 연결에 실패했습니다. 인터넷 연결을 확인해주세요."
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
    );
  }
}

/**
 * POST /convert/preview - 카카오톡 메시지 미리보기
 */
export async function convertPreview(
  file: File
): Promise<ConvertPreviewResponse> {
  return apiUpload<ConvertPreviewResponse>("/convert/preview", file);
}
