import * as XLSX from "xlsx";
import { Message } from "@/store/useConvertStore";
import { downloadBlob } from "./download";

/**
 * 메시지 배열을 엑셀 파일로 변환하고 다운로드
 */
export function convertMessagesToExcel(
  messages: Message[],
  filename: string = "kakaotalk-converted.xlsx"
): void {
  // 엑셀 데이터 준비
  const excelData = messages.map((msg) => {
    const date = new Date(msg.timestamp);

    // 날짜와 시간을 직접 포맷팅
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");

    // 오전/오후 구분
    const ampm = hour < 12 ? "오전" : "오후";
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    // 날짜: "2025. 12. 30." 형식
    const dateStr = `${year}. ${month}. ${day}.`;
    // 시간: "오후 6:01" 형식
    const timeStr = `${ampm} ${hour12}:${minute}`;

    // 타입을 한글로 변환
    const typeMap: Record<string, string> = {
      message: "메시지",
      system: "시스템",
      image: "이미지",
      video: "동영상",
    };

    const typeStr = typeMap[msg.type] || msg.type;

    // 시스템 메시지인 경우
    if (msg.type === "system") {
      return {
        날짜: dateStr,
        시간: timeStr,
        보낸사람: "",
        타입: "",
        내용: `[${typeStr}] ${msg.content}`,
      };
    }

    return {
      날짜: dateStr,
      시간: timeStr,
      보낸사람: msg.sender,
      타입: typeStr,
      내용: msg.content,
    };
  });

  // 워크북 생성
  const wb = XLSX.utils.book_new();

  // 워크시트 생성
  const ws = XLSX.utils.json_to_sheet(excelData);

  // 컬럼 너비 설정
  ws["!cols"] = [
    { wch: 15 }, // 날짜
    { wch: 10 }, // 시간
    { wch: 10 }, // 보낸사람
    { wch: 50 }, // 내용
    { wch: 10 }, // 타입
  ];

  // 워크시트를 워크북에 추가
  XLSX.utils.book_append_sheet(wb, ws, "대화내용");

  // 엑셀 파일을 Blob으로 변환
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // 다운로드
  downloadBlob(blob, filename);
}
