import jsPDF from "jspdf";
import { Message, useConvertStore } from "@/store/useConvertStore";
import { downloadBlob } from "./download";

/**
 * 모든 텍스트를 Canvas로 렌더링하여 PDF에 삽입하는 헬퍼 함수 (일관된 크기 보장)
 */
function addKoreanText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number = 4.5,
  isBold: boolean = false
): { height: number } {
  // 모든 텍스트를 Canvas로 렌더링하여 일관된 크기 보장
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    // Canvas를 사용할 수 없는 경우 기본 텍스트 렌더링
    const splitText = doc.splitTextToSize(text, maxWidth);
    doc.text(splitText, x, y, { maxWidth, align: "left" });
    return { height: splitText.length * fontSize * 0.4 };
  }

  // Canvas 크기 설정 (mm to px 변환: 1mm = 3.779527559px)
  const scale = 3.779527559;
  const canvasFontSize = fontSize * scale;
  // 여유 공간을 고려하여 최대 너비 설정 (5% 여유)
  const maxLineWidth = maxWidth * 0.95 * scale;

  // 초기 Canvas 크기 (충분히 크게 설정, 여유 공간 포함)
  canvas.width = Math.ceil(maxLineWidth + canvasFontSize * 2); // 여유 공간 추가
  // 높이는 나중에 실제 필요한 만큼 조정되므로 충분히 크게 설정
  canvas.height = canvasFontSize * 100; // 최대 100줄까지 처리 가능

  // 폰트 설정 (시스템 폰트 사용 - 한글/영문 모두 지원)
  const fontWeight = isBold ? "bold" : "normal";
  ctx.font = `${fontWeight} ${canvasFontSize}px "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif`;
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";

  // 텍스트를 여러 줄로 분할 (단어 단위가 아닌 문자 단위로)
  const chars = text.split("");
  let line = "";
  const lines: string[] = [];
  const padding = canvasFontSize * 0.5; // 좌우 여유 공간

  chars.forEach((char) => {
    const testLine = line + char;
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;

    // 여유 공간을 고려하여 줄바꿈
    if (testWidth > maxLineWidth && line.length > 0) {
      lines.push(line);
      line = char;
    } else {
      line = testLine;
    }
  });
  if (line.length > 0) {
    lines.push(line);
  }

  // Canvas 높이를 실제 필요한 만큼만 조정 (충분한 여유 공간)
  const lineSpacing = canvasFontSize * 1.95; // 줄 간격 (1.5배 증가: 1.3 * 1.5)
  const topPadding = canvasFontSize * 0.3; // 1.5배 증가: 0.2 * 1.5
  const bottomPadding = canvasFontSize * 0.45; // 1.5배 증가: 0.3 * 1.5
  const actualHeight = lines.length * lineSpacing + topPadding + bottomPadding;
  // 내용이 길어도 모두 표시되도록 충분한 높이 확보
  canvas.height = Math.max(Math.ceil(actualHeight), canvasFontSize * 2);

  // Canvas 초기화 (흰색 배경)
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 폰트 다시 설정 (초기화 후)
  ctx.font = `${fontWeight} ${canvasFontSize}px "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif`;
  ctx.fillStyle = "#000000";
  ctx.textBaseline = "top";

  // Canvas에 텍스트 그리기 (여유 공간 고려)
  lines.forEach((line, index) => {
    const yPos = index * lineSpacing + topPadding;
    ctx.fillText(line, padding, yPos);
  });

  // Canvas를 이미지로 변환하여 PDF에 추가
  const imgData = canvas.toDataURL("image/png");
  const imgHeight = actualHeight / scale;
  // 이미지 너비도 여유 공간을 고려하여 조정
  const imgWidth = (canvas.width - padding * 2) / scale;
  doc.addImage(imgData, "PNG", x, y - fontSize * 0.7, imgWidth, imgHeight);

  return { height: imgHeight };
}

/**
 * 메시지 배열을 PDF 파일로 변환하고 다운로드
 */
export function convertMessagesToPDF(
  messages: Message[],
  filename: string = "kakaotalk-converted.pdf"
): void {
  const { options } = useConvertStore.getState();
  const showDate = options.showDate ?? true;
  const showTime = options.showTime ?? true;
  const showSender = options.showSender ?? true;
  const showType = options.showType ?? true;
  const showContent = options.showContent ?? true;

  // PDF 생성
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // 폰트 설정 (4.5포인트 - 기존의 반)
  const fontSize = 4.5;
  const baseLineHeight = 3.75; // 기본 행 높이 (1.5배 증가: 2.5 * 1.5)
  const margin = 10;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin + 10;

  // 헤더 생성
  const headers: string[] = [];
  if (showDate) headers.push("날짜");
  if (showTime) headers.push("시간");
  if (showSender) headers.push("보낸사람");
  if (showType) headers.push("타입");
  if (showContent) headers.push("내용");

  // 컬럼 너비 계산 - 내용 칸을 가장 넓게 설정
  const colCount = headers.length;
  const otherColCount = colCount - 1; // 내용 칸 제외한 컬럼 수
  const otherColMinWidth = 35; // 다른 컬럼들의 너비 (mm) - 1.8배 증가: 15 * 1.8
  const otherColsTotalWidth = otherColMinWidth * otherColCount;
  const contentColWidth = contentWidth - otherColsTotalWidth; // 내용 칸 너비 (나머지 공간 모두)

  // 컬럼 너비 배열 생성
  const getColWidth = (index: number): number => {
    const headerName = headers[index];
    if (headerName === "내용") {
      return contentColWidth;
    }
    return otherColMinWidth;
  };

  // 헤더 그리기
  const drawHeader = () => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "bold");
    let xPos = margin;
    headers.forEach((header, index) => {
      const colWidth = getColWidth(index);
      // 한글 헤더는 이미지로 변환하여 추가 (진하게)
      addKoreanText(doc, header, xPos, yPos, colWidth - 1, fontSize, true);
      xPos += colWidth;
    });
    // 헤더 높이 계산 (대략적으로)
    const headerHeight = baseLineHeight * 1.5;
    yPos += headerHeight;
    // 헤더 바로 밑에 선 그리기
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 4; // 헤더 후 간격 더 늘리기
  };

  drawHeader();

  // 데이터 행 그리기
  messages.forEach((msg) => {
    // 페이지 넘김 체크
    if (yPos > pageHeight - margin - 15) {
      doc.addPage();
      yPos = margin + 10;
      drawHeader();
    }

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

    // 데이터 준비
    const rowData: string[] = [];
    if (showDate) rowData.push(dateStr);
    if (showTime) rowData.push(timeStr);
    if (showSender) rowData.push(msg.type === "system" ? "" : msg.sender);
    if (showType) rowData.push(msg.type === "system" ? "" : typeStr);
    if (showContent) {
      // 마커 제거 (PDF에서는 아이콘 대신 텍스트만)
      const cleanContent = msg.content.replace(/__IMAGE_ICON__/g, "");
      const content =
        msg.type === "system" ? `[${typeStr}] ${cleanContent}` : cleanContent;
      rowData.push(content);
    }

    // 행 그리기
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", "normal");
    let xPos = margin;
    let maxRowHeight = baseLineHeight;
    const cellHeights: number[] = [];

    // 먼저 모든 셀의 실제 높이를 계산 (실제 렌더링 결과 사용)
    rowData.forEach((cell, index) => {
      const colWidth = getColWidth(index);
      const maxWidth = colWidth - 2;
      const cellText = cell || "";

      // 실제 텍스트 렌더링을 통해 높이 계산
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        const scale = 3.779527559;
        const canvasFontSize = fontSize * scale;
        const maxLineWidth = maxWidth * 0.95 * scale;

        tempCtx.font = `${canvasFontSize}px "Malgun Gothic", "맑은 고딕", "Apple SD Gothic Neo", "Noto Sans KR", Arial, sans-serif`;

        // 실제 줄바꿈 계산
        const chars = cellText.split("");
        let line = "";
        const lines: string[] = [];

        chars.forEach((char) => {
          const testLine = line + char;
          const metrics = tempCtx.measureText(testLine);
          if (metrics.width > maxLineWidth && line.length > 0) {
            lines.push(line);
            line = char;
          } else {
            line = testLine;
          }
        });
        if (line.length > 0) {
          lines.push(line);
        }

        // 실제 높이 계산
        const lineSpacing = canvasFontSize * 1.95;
        const topPadding = canvasFontSize * 0.3;
        const bottomPadding = canvasFontSize * 0.45;
        const actualHeight =
          (lines.length * lineSpacing + topPadding + bottomPadding) / scale;
        cellHeights.push(actualHeight);

        if (actualHeight > maxRowHeight) {
          maxRowHeight = actualHeight;
        }
      } else {
        // Canvas를 사용할 수 없는 경우 기본 높이
        cellHeights.push(baseLineHeight);
      }
    });

    // 모든 셀의 실제 높이 중 최대값 사용 (내용이 길어도 모두 표시)
    const finalRowHeight = Math.max(maxRowHeight, baseLineHeight);

    // 각 셀 그리기
    rowData.forEach((cell, index) => {
      const colWidth = getColWidth(index);
      const maxWidth = colWidth - 2;
      const cellText = cell || "";

      // 한글 텍스트를 이미지로 변환하여 추가 (자동 줄바꿈 포함, 전체 내용 표시)
      addKoreanText(doc, cellText, xPos, yPos, maxWidth, fontSize);

      xPos += colWidth;
    });

    yPos += finalRowHeight * 1.5 * 0.8 + 1.5 * 0.8; // 행 간격 0.8배로 줄이기
  });

  // PDF를 Blob으로 변환
  const pdfBlob = doc.output("blob");

  // 다운로드
  downloadBlob(pdfBlob, filename);
}
