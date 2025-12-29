import * as XLSX from 'xlsx';
import { Message } from '@/store/useConvertStore';
import { downloadBlob } from './download';

/**
 * 메시지 배열을 엑셀 파일로 변환하고 다운로드
 */
export function convertMessagesToExcel(
  messages: Message[],
  filename: string = 'kakaotalk-converted.xlsx'
): void {
  // 엑셀 데이터 준비
  const excelData = messages.map((msg) => ({
    날짜시간: new Date(msg.timestamp).toLocaleString('ko-KR'),
    보낸사람: msg.sender,
    내용: msg.content,
    타입: msg.type === 'system' ? '시스템' : '메시지',
  }));

  // 워크북 생성
  const wb = XLSX.utils.book_new();
  
  // 워크시트 생성
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // 컬럼 너비 설정
  ws['!cols'] = [
    { wch: 20 }, // 날짜시간
    { wch: 15 }, // 보낸사람
    { wch: 50 }, // 내용
    { wch: 10 }, // 타입
  ];

  // 워크시트를 워크북에 추가
  XLSX.utils.book_append_sheet(wb, ws, '대화내용');

  // 엑셀 파일을 Blob으로 변환
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // 다운로드
  downloadBlob(blob, filename);
}

