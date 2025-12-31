/**
 * 날짜 및 시간 포맷팅 유틸리티
 */

/**
 * ISO 8601 날짜 문자열을 한국어 형식으로 변환
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns "2025. 12. 30." 형식의 문자열
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}. ${month}. ${day}.`;
}

/**
 * ISO 8601 날짜 문자열을 시간 형식으로 변환
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns "오후 6:01" 형식의 문자열
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hour = date.getHours();
  const minute = String(date.getMinutes()).padStart(2, "0");
  const ampm = hour < 12 ? "오전" : "오후";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${ampm} ${hour12}:${minute}`;
}

/**
 * 날짜와 시간을 함께 포맷팅
 * @param isoString - ISO 8601 형식의 날짜 문자열
 * @returns "2025. 12. 30. 오후 6:01" 형식의 문자열
 */
export function formatDateTime(isoString: string): string {
  return `${formatDate(isoString)} ${formatTime(isoString)}`;
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 * @param bytes - 바이트 단위 크기
 * @returns "1.5 MB" 형식의 문자열
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

