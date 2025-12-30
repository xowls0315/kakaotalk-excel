import { Injectable } from '@nestjs/common';

export interface ParseOptions {
  includeSystem?: boolean;
  dateFrom?: string;
  dateTo?: string;
  participants?: string[];
}

export interface ParsedMessage {
  at: Date;
  sender: string;
  message: string;
  type: 'text' | 'system';
}

export interface ParseResult {
  roomName: string;
  messages: ParsedMessage[];
  participants: string[];
}

@Injectable()
export class ParserService {
  parseKakaoTalkFile(
    fileContent: string,
    options: ParseOptions = {},
  ): ParseResult {
    const lines = fileContent.split('\n');
    const messages: ParsedMessage[] = [];
    const participantsSet = new Set<string>();
    let roomName = '';
    let currentDate: Date | null = null;
    let isMultilineMessage = false;
    let lastMessageIndex = -1;

    // 채팅방 이름 추출 (예: ⚪노씨의 sw개발자 취업 (코딩테스트, 기술면접) 님과 카카오톡 대화)
    const firstLine = lines[0]?.trim() || '';
    if (firstLine.includes('님과 카카오톡 대화')) {
      const match = firstLine.match(/[⚪⚫]?([^님]+)님과 카카오톡 대화/);
      if (match) {
        roomName = match[1].trim();
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 빈 줄 처리
      if (!line) {
        isMultilineMessage = false;
        continue;
      }

      // 날짜 구분선 패턴 매칭 (예: --------------- 2025년 12월 28일 일요일 ---------------)
      const dateSeparatorMatch = line.match(
        /^[-]+\s*(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/,
      );
      if (dateSeparatorMatch) {
        const year = parseInt(dateSeparatorMatch[1], 10);
        const month = parseInt(dateSeparatorMatch[2], 10) - 1;
        const day = parseInt(dateSeparatorMatch[3], 10);
        currentDate = new Date(year, month, day);
        isMultilineMessage = false;
        continue;
      }

      // 일반 메시지 패턴 매칭 (예: [닉네임] [오전/오후 HH:MM] 메시지)
      // 또는 (예: [닉네임] [HH:MM] 메시지)
      const messageMatch = line.match(
        /^\[([^\]]+)\]\s*\[(오전|오후)?\s*(\d{1,2}):(\d{2})\]\s*(.+)$/,
      );
      if (messageMatch && currentDate) {
        isMultilineMessage = false;
        const sender = messageMatch[1].trim();
        const ampm = messageMatch[2]?.trim() || '';
        const hour = parseInt(messageMatch[3], 10);
        const minute = parseInt(messageMatch[4], 10);
        const message = messageMatch[5].trim();

        // 12시간 형식을 24시간 형식으로 변환
        let hour24 = hour;
        if (ampm === '오후' && hour !== 12) {
          hour24 = hour + 12;
        } else if (ampm === '오전' && hour === 12) {
          hour24 = 0;
        }

        const messageDate = new Date(currentDate);
        messageDate.setHours(hour24, minute, 0, 0);

        // 시스템 메시지 판단
        const isSystemMessage =
          line.includes('들어왔습니다') ||
          line.includes('나갔습니다') ||
          line.includes('초대했습니다') ||
          line.includes('내보냈습니다') ||
          line.includes('사진') ||
          line.includes('이모티콘') ||
          line.includes('파일') ||
          line.includes('동영상') ||
          line.includes('음성') ||
          line.includes('지도') ||
          line.includes('연락처') ||
          line.includes('페이스톡') ||
          sender.includes('봇');

        // 필터링
        if (!options?.includeSystem && isSystemMessage) {
          continue;
        }

        if (options?.dateFrom || options?.dateTo) {
          const messageTime = messageDate.getTime();
          if (options.dateFrom) {
            const fromTime = new Date(options.dateFrom).getTime();
            if (messageTime < fromTime) continue;
          }
          if (options.dateTo) {
            const toTime = new Date(options.dateTo).getTime();
            if (messageTime > toTime) continue;
          }
        }

        if (options?.participants && options.participants.length > 0) {
          if (!options.participants.includes(sender)) {
            continue;
          }
        }

        participantsSet.add(sender);
        messages.push({
          at: messageDate,
          sender,
          message,
          type: isSystemMessage ? 'system' : 'text',
        });
        lastMessageIndex = messages.length - 1;
        isMultilineMessage = true;
      } else if (isMultilineMessage && lastMessageIndex >= 0) {
        // 멀티라인 메시지 처리 (이전 메시지의 연속)
        // 날짜 구분선이나 새 메시지가 아닌 경우
        if (!line.match(/^[-]+/) && !line.match(/^\[/)) {
          messages[lastMessageIndex].message += '\n' + line;
        } else {
          isMultilineMessage = false;
        }
      } else {
        // 시스템 메시지 (닉네임이 없는 경우, 예: "님이 들어왔습니다.")
        if (line.includes('들어왔습니다') || line.includes('나갔습니다')) {
          if (!options?.includeSystem) {
            continue;
          }
          if (currentDate) {
            // 시스템 메시지는 시간 정보가 없으므로 현재 날짜의 00:00으로 설정
            const messageDate = new Date(currentDate);
            messageDate.setHours(0, 0, 0, 0);
            messages.push({
              at: messageDate,
              sender: '시스템',
              message: line,
              type: 'system',
            });
          }
        }
        isMultilineMessage = false;
      }
    }

    return {
      roomName: roomName || '채팅방',
      messages,
      participants: Array.from(participantsSet).sort(),
    };
  }

  getPreview(messages: ParsedMessage[], limit = 200): ParsedMessage[] {
    return messages.slice(0, limit);
  }
}
