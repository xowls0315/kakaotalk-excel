import { Message } from "@/store/useConvertStore";

/**
 * 카카오톡 날짜/시간 파싱 함수
 */
export function parseKakaoTalkDateTime(
  timeStr: string,
  dateStr?: string
): Date {
  // 시간 파싱: "오후 12:40" 또는 "오전 9:59"
  const timeMatch = timeStr.match(/(오전|오후)\s*(\d{1,2}):(\d{2})/);
  if (!timeMatch) return new Date();

  const [, ampm, hour, minute] = timeMatch;
  let hour24 = parseInt(hour, 10);

  if (ampm === "오후" && hour24 !== 12) hour24 += 12;
  if (ampm === "오전" && hour24 === 12) hour24 = 0;

  // 날짜 파싱: "--------------- 2025년 12월 29일 월요일 ---------------"
  let year = new Date().getFullYear();
  let month = new Date().getMonth();
  let day = new Date().getDate();

  if (dateStr) {
    const dateMatch = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (dateMatch) {
      const [, y, m, d] = dateMatch;
      year = parseInt(y, 10);
      month = parseInt(m, 10) - 1;
      day = parseInt(d, 10);
    }
  }

  return new Date(year, month, day, hour24, parseInt(minute, 10));
}

/**
 * 카카오톡 대화 내보내기 파일 파서
 */
export function parseKakaoTalkFile(content: string): Message[] {
  const lines = content.split("\n");
  const messages: Message[] = [];
  let currentDate: string | undefined = undefined;

  // 메시지 패턴: "[IT_ 황태진 (25)] [오후 12:40] 메시지 내용"
  const messagePattern =
    /^\[(.+?)\]\s*\[(오전|오후)\s*(\d{1,2}):(\d{2})\]\s*(.+)$/;

  // 날짜 구분선 패턴: "--------------- 2025년 12월 29일 월요일 ---------------"
  const dateSeparatorPattern =
    /^-+\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s*.+-+$/;

  let currentMessage: {
    sender: string;
    time: string;
    content: string[];
  } | null = null;

  const flushCurrentMessage = () => {
    if (currentMessage) {
      const timestamp = parseKakaoTalkDateTime(
        currentMessage.time,
        currentDate
      );
      let content = currentMessage.content.join(" ").trim();
      let type: "message" | "system" | "image" | "video" = "message";

      // 내용이 "사진"만 있거나 "사진 + 숫자 + 장" 패턴이면 처리
      if (content === "사진") {
        content = "__IMAGE_ICON__사진";
        type = "image";
      } else if (/^사진\s*\d+\s*장$/.test(content)) {
        // "사진 2장", "사진 3장" 등의 패턴
        content = content.replace(/^사진/, "__IMAGE_ICON__사진");
        type = "image";
      }
      // 내용이 "동영상"만 있으면 처리
      else if (content === "동영상") {
        content = "동영상🎞";
        type = "video";
      }

      messages.push({
        timestamp: timestamp.toISOString(),
        sender: currentMessage.sender.trim(),
        content,
        type,
      });
      currentMessage = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 빈 줄 처리
    if (!line) {
      flushCurrentMessage();
      continue;
    }

    // 헤더 라인 건너뛰기
    if (
      line.includes("님과 카카오톡 대화") ||
      line.includes("저장한 날짜") ||
      line === "카카오톡 대화 내보내기"
    ) {
      continue;
    }

    // 날짜 구분선 처리
    const dateMatch = line.match(dateSeparatorPattern);
    if (dateMatch) {
      currentDate = line;
      flushCurrentMessage();
      continue;
    }

    // 메시지 패턴 매칭
    const messageMatch = line.match(messagePattern);
    if (messageMatch) {
      flushCurrentMessage();

      const [, sender, ampm, hour, minute, content] = messageMatch;
      currentMessage = {
        sender,
        time: `${ampm} ${hour}:${minute}`,
        content: [content],
      };
    } else if (currentMessage) {
      // 여러 줄 메시지 처리
      currentMessage.content.push(line);
    } else {
      // 시간/날짜 패턴이 없는 텍스트는 시스템 메시지로 처리
      messages.push({
        timestamp: new Date().toISOString(), // 현재 시간으로 임시 설정
        sender: "",
        content: line,
        type: "system",
      });
    }
  }

  // 마지막 메시지 처리
  flushCurrentMessage();

  return messages;
}
