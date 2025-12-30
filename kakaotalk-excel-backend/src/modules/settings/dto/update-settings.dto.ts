import { IsOptional, IsBoolean, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiProperty({
    description: '기본 시스템 메시지 포함 여부',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  defaultIncludeSystem?: boolean;

  @ApiProperty({
    description: '기본 날짜별 시트 분할 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  defaultSplitSheetsByDay?: boolean;

  @ApiProperty({
    description: '기본 날짜 범위 (일 단위)',
    example: 30,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  defaultDateRangeDays?: number;
}
