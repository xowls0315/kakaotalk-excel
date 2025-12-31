/**
 * 공통 타입 정의
 * 백엔드 API 응답과 프론트엔드에서 사용하는 타입들을 정의
 */

// ===== 인증 관련 타입 =====
export interface User {
  id: string;
  email?: string;
  name?: string;
}

export interface BackendUser {
  id: number;
  nickname: string;
  email?: string;
  provider: string;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  user: User | null;
}

// ===== 메시지 관련 타입 =====
export interface Message {
  timestamp: string; // ISO 8601 date-time
  sender: string;
  content: string;
  type: "message" | "system" | "image" | "video";
}

// 백엔드 API 응답 형식
export interface BackendMessage {
  at: string; // ISO 8601 date-time
  sender: string;
  message: string;
  type: "text" | "system";
}

// ===== 변환 옵션 타입 =====
export interface ConvertOptions {
  excludeSystemMessages: boolean;
  dateStart?: string;
  dateEnd?: string;
  selectedParticipants?: string[];
  showDate?: boolean;
  showTime?: boolean;
  showSender?: boolean;
  showType?: boolean;
  showContent?: boolean;
}

// ===== 작업(Job) 관련 타입 =====
export interface Job {
  id: string;
  originalFileName: string;
  status: "previewed" | "processing" | "success" | "failed" | "expired";
  createdAt: string;
  finishedAt?: string;
  roomName?: string;
  totalMessages?: number;
}

export interface JobDetail extends Job {
  optionsJson?: {
    includeSystem?: boolean;
    dateFrom?: string;
    dateTo?: string;
    participants?: string[];
    splitSheetsByDay?: boolean;
  };
}

// ===== API 에러 타입 =====
export interface ApiError {
  message: string;
  statusCode?: number;
}

