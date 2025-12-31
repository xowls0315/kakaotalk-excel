/**
 * 유효성 검사 유틸리티
 */

/**
 * 파일이 유효한 카카오톡 내보내기 파일인지 확인
 * @param file - 검사할 파일
 * @returns 유효성 검사 결과와 에러 메시지
 */
export function validateKakaoTalkFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // 파일 확장자 확인
  if (!file.name.endsWith(".txt")) {
    return {
      valid: false,
      error: "카카오톡에서 내보낸 .txt 파일만 사용할 수 있어요.",
    };
  }

  // 파일 크기 확인 (10MB 제한)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "파일이 조금 커요. 10MB 이하로 부탁드려요.",
    };
  }

  // 빈 파일 확인
  if (file.size === 0) {
    return {
      valid: false,
      error: "파일이 비어있어요.",
    };
  }

  return { valid: true };
}

/**
 * 날짜 범위 유효성 검사
 * @param dateStart - 시작 날짜
 * @param dateEnd - 종료 날짜
 * @returns 유효성 검사 결과와 에러 메시지
 */
export function validateDateRange(
  dateStart?: string,
  dateEnd?: string
): {
  valid: boolean;
  error?: string;
} {
  if (!dateStart || !dateEnd) {
    return { valid: true }; // 날짜 범위는 선택사항
  }

  const start = new Date(dateStart);
  const end = new Date(dateEnd);

  if (start > end) {
    return {
      valid: false,
      error: "시작 날짜가 종료 날짜보다 늦을 수 없어요.",
    };
  }

  return { valid: true };
}
