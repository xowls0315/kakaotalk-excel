import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { ParsedMessage } from '../parser/parser.service';

/**
 * 한국 시간대(KST, UTC+9)로 날짜 문자열을 생성하는 유틸리티 함수
 */
function getKSTDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface ExcelOptions {
  splitSheetsByDay?: boolean;
}

@Injectable()
export class ExcelService {
  createExcel(
    messages: ParsedMessage[],
    roomName: string,
    options: ExcelOptions = {},
  ): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'KakaoTalk Excel Converter';
    workbook.created = new Date();

    if (options.splitSheetsByDay) {
      const messagesByDate = this.groupMessagesByDate(messages);
      for (const [dateStr, dayMessages] of Object.entries(messagesByDate)) {
        const sheet = workbook.addWorksheet(dateStr);
        this.addMessagesToSheet(sheet, dayMessages);
      }
    } else {
      const sheet = workbook.addWorksheet(roomName || '채팅내용');
      this.addMessagesToSheet(sheet, messages);
    }

    return Promise.resolve(workbook);
  }

  addMessagesToSheet(sheet: ExcelJS.Worksheet, messages: ParsedMessage[]) {
    sheet.columns = [
      { header: '날짜/시간', key: 'at', width: 20 },
      { header: '보낸사람', key: 'sender', width: 15 },
      { header: '메시지', key: 'message', width: 50 },
      { header: '타입', key: 'type', width: 10 },
    ];

    // 헤더 스타일
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // 데이터 추가 (한국 시간대를 올바르게 처리)
    messages.forEach((msg) => {
      // 한국 시간대(KST, UTC+9)의 날짜/시간을 그대로 유지
      const kstYear = msg.at.getFullYear();
      const kstMonth = msg.at.getMonth();
      const kstDate = msg.at.getDate();
      const kstHours = msg.at.getHours();
      const kstMinutes = msg.at.getMinutes();
      const kstSeconds = msg.at.getSeconds();
      const kstMilliseconds = msg.at.getMilliseconds();

      // ExcelJS는 Date 객체를 받으면 내부적으로 UTC로 저장합니다.
      const excelDate = new Date(
        Date.UTC(
          kstYear,
          kstMonth,
          kstDate,
          kstHours,
          kstMinutes,
          kstSeconds,
          kstMilliseconds,
        ),
      );

      sheet.addRow({
        at: excelDate,
        sender: msg.sender,
        message: msg.message,
        type: msg.type,
      });
    });

    // 날짜 형식 설정
    sheet.getColumn('at').numFmt = 'yyyy-mm-dd hh:mm:ss';
    sheet.getColumn('message').alignment = { wrapText: true, vertical: 'top' };
  }

  groupMessagesByDate(
    messages: ParsedMessage[],
  ): Record<string, ParsedMessage[]> {
    const grouped: Record<string, ParsedMessage[]> = {};
    messages.forEach((msg) => {
      // 한국 시간대(KST)로 날짜 문자열 생성
      const dateStr = getKSTDateString(msg.at);
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(msg);
    });
    return grouped;
  }

  async workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
