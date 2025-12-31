import * as XLSX from "xlsx";
import { Message, useConvertStore } from "@/store/useConvertStore";
import { downloadBlob } from "./download";

/**
 * 메시지 배열을 엑셀 파일로 변환하고 다운로드
 */
export function convertMessagesToExcel(
  messages: Message[],
  filename: string = "kakaotalk-converted.xlsx"
): void {
  const { options } = useConvertStore.getState();
  const showDate = options.showDate ?? true;
  const showTime = options.showTime ?? true;
  const showSender = options.showSender ?? true;
  const showType = options.showType ?? true;
  const showContent = options.showContent ?? true;
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
      const row: Record<string, string> = {};
      if (showDate) row["날짜"] = dateStr;
      if (showTime) row["시간"] = timeStr;
      if (showSender) row["보낸사람"] = "";
      if (showType) row["타입"] = "";
      if (showContent) row["내용"] = `[${typeStr}] ${msg.content}`;
      return row;
    }

    const row: Record<string, string> = {};
    if (showDate) row["날짜"] = dateStr;
    if (showTime) row["시간"] = timeStr;
    if (showSender) row["보낸사람"] = msg.sender;
    if (showType) row["타입"] = typeStr;
    if (showContent) {
      // 마커 제거 (Excel/CSV에서는 아이콘 대신 텍스트만)
      row["내용"] = msg.content.replace(/__IMAGE_ICON__/g, "");
    }
    return row;
  });

  // 워크북 생성
  const wb = XLSX.utils.book_new();

  // 워크시트 생성
  const ws = XLSX.utils.json_to_sheet(excelData);

  // 컬럼 너비 설정 (선택된 컬럼만)
  const colWidths: { wch: number }[] = [];
  if (showDate) colWidths.push({ wch: 15 }); // 날짜
  if (showTime) colWidths.push({ wch: 10 }); // 시간
  if (showSender) colWidths.push({ wch: 10 }); // 보낸사람
  if (showType) colWidths.push({ wch: 10 }); // 타입
  if (showContent) colWidths.push({ wch: 50 }); // 내용
  ws["!cols"] = colWidths;

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

/**
 * 메시지 배열을 CSV 파일로 변환하고 다운로드
 */
export function convertMessagesToCSV(
  messages: Message[],
  filename: string = "kakaotalk-converted.csv"
): void {
  const { options } = useConvertStore.getState();
  const showDate = options.showDate ?? true;
  const showTime = options.showTime ?? true;
  const showSender = options.showSender ?? true;
  const showType = options.showType ?? true;
  const showContent = options.showContent ?? true;

  // CSV 헤더 생성
  const headers: string[] = [];
  if (showDate) headers.push("날짜");
  if (showTime) headers.push("시간");
  if (showSender) headers.push("보낸사람");
  if (showType) headers.push("타입");
  if (showContent) headers.push("내용");

  // CSV 데이터 준비
  const csvRows: string[] = [headers.join(",")];

  messages.forEach((msg) => {
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

    // CSV 행 데이터
    const row: string[] = [];

    // 시스템 메시지인 경우
    if (msg.type === "system") {
      if (showDate) row.push(`"${dateStr}"`);
      if (showTime) row.push(`"${timeStr}"`);
      if (showSender) row.push('""');
      if (showType) row.push('""');
      if (showContent)
        row.push(
          `"[${typeStr}] ${msg.content
            .replace(/__IMAGE_ICON__/g, "")
            .replace(/"/g, '""')}"`
        );
    } else {
      if (showDate) row.push(`"${dateStr}"`);
      if (showTime) row.push(`"${timeStr}"`);
      if (showSender) row.push(`"${msg.sender.replace(/"/g, '""')}"`);
      if (showType) row.push(`"${typeStr}"`);
      if (showContent)
        row.push(
          `"${msg.content.replace(/__IMAGE_ICON__/g, "").replace(/"/g, '""')}"`
        );
    }

    csvRows.push(row.join(","));
  });

  // CSV 문자열 생성
  const csvContent = csvRows.join("\n");

  // BOM 추가 (한글 깨짐 방지)
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  // 다운로드
  downloadBlob(blob, filename);
}
