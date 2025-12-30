import { IsOptional, IsBoolean, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ExcelRequestDto {
  @ApiPropertyOptional({
    description: '시스템 메시지 포함 여부',
    type: Boolean,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  includeSystem?: boolean;

  @ApiPropertyOptional({
    description: '시작 날짜 (ISO 8601 형식: YYYY-MM-DD)',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: '종료 날짜 (ISO 8601 형식: YYYY-MM-DD)',
    type: String,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  dateTo?: string;

  @ApiPropertyOptional({
    description: '필터링할 참여자 목록 (JSON 배열 문자열)',
    type: [String],
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed as string[];
        }
      } catch {
        // JSON 파싱 실패 시 무시
      }
      // 쉼표로 구분된 문자열인 경우
      if (value.includes(',')) {
        return value
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s);
      }
      // 단일 문자열인 경우 배열로 변환
      return [value.trim()].filter((s: string) => s);
    }
    if (Array.isArray(value)) {
      return value as string[];
    }
    return undefined;
  })
  @IsArray()
  @IsString({ each: true })
  participants?: string[];

  @ApiPropertyOptional({
    description: '날짜별로 시트 분할 여부',
    type: Boolean,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  splitSheetsByDay?: boolean;
}
