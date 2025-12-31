import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  destination?: string;
  filename?: string;
  path?: string;
}
import { JobsService } from './jobs.service';
import { PreviewRequestDto } from './dto/preview-request.dto';
import { ExcelRequestDto } from './dto/excel-request.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GuestSession } from '../../common/decorators/guest-session.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Convert')
@Controller()
export class JobsController {
  constructor(
    private jobsService: JobsService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('convert/preview')
  @ApiOperation({
    summary: '카카오톡 메시지 미리보기',
    description:
      '카카오톡 대화 내보내기(.txt) 파일을 업로드하여 파싱 결과를 미리보기합니다. 게스트 모드와 로그인 사용자 모두 사용 가능합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '카카오톡 대화 내보내기 .txt 파일',
        },
        includeSystem: {
          type: 'boolean',
          description: '시스템 메시지 포함 여부',
          example: false,
        },
        dateFrom: {
          type: 'string',
          format: 'date',
          description: '시작 날짜 (YYYY-MM-DD)',
          example: '2024-01-01',
        },
        dateTo: {
          type: 'string',
          format: 'date',
          description: '종료 날짜 (YYYY-MM-DD)',
          example: '2024-12-31',
        },
        participants: {
          type: 'string',
          description: '필터링할 참여자 목록 (JSON 배열 문자열)',
          example: '["홍길동", "김철수"]',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '미리보기 성공',
    schema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          format: 'uuid',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        roomName: {
          type: 'string',
          example: '채팅방 이름',
        },
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              at: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-01T10:00:00.000+09:00',
              },
              sender: {
                type: 'string',
                example: '홍길동',
              },
              message: {
                type: 'string',
                example: '안녕하세요',
              },
              type: {
                type: 'string',
                enum: ['text', 'system'],
                example: 'text',
              },
            },
          },
        },
        participants: {
          type: 'array',
          items: { type: 'string' },
          example: ['홍길동', '김철수'],
        },
        stats: {
          type: 'object',
          properties: {
            totalLines: { type: 'number', example: 1000 },
            previewCount: { type: 'number', example: 200 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일 없음, 잘못된 형식, 파일 크기 초과 등)',
  })
  @ApiResponse({
    status: 413,
    description: '파일 크기 초과 (최대 10MB)',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB 제한 (환경 변수는 메서드 내에서 검증)
      },
    }),
  )
  async preview(
    @UploadedFile() file: MulterFile,
    @Body() options: PreviewRequestDto,
    @CurrentUser() user?: User,
    @GuestSession() guestSessionId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!file.originalname.endsWith('.txt')) {
      throw new BadRequestException('Only .txt files are allowed');
    }

    // 파일 크기 검증 (환경 변수에서 가져온 값 사용)
    const maxFileSize =
      this.configService.get<number>('app.maxFileSize') || 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
      throw new BadRequestException(
        `File size exceeds the limit of ${maxSizeMB}MB`,
      );
    }
    return this.jobsService.createPreview(
      file,
      options,
      user?.id,
      guestSessionId,
    );
  }

  @Public()
  @Post('convert/excel')
  @ApiOperation({
    summary: '엑셀 파일 생성 및 다운로드',
    description:
      '카카오톡 대화 내보내기(.txt) 파일을 업로드하여 엑셀(.xlsx) 파일로 변환하고 다운로드합니다. 게스트 모드와 로그인 사용자 모두 사용 가능합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: '카카오톡 대화 내보내기 .txt 파일',
        },
        includeSystem: {
          type: 'boolean',
          description: '시스템 메시지 포함 여부',
          example: false,
        },
        splitSheetsByDay: {
          type: 'boolean',
          description: '날짜별로 시트 분할 여부',
          example: true,
        },
        dateFrom: {
          type: 'string',
          format: 'date',
          description: '시작 날짜 (YYYY-MM-DD)',
          example: '2024-01-01',
        },
        dateTo: {
          type: 'string',
          format: 'date',
          description: '종료 날짜 (YYYY-MM-DD)',
          example: '2024-12-31',
        },
        participants: {
          type: 'string',
          description: '필터링할 참여자 목록 (JSON 배열 문자열)',
          example: '["홍길동", "김철수"]',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '엑셀 파일 생성 성공 (파일 다운로드)',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (파일 없음, 잘못된 형식, 파일 크기 초과 등)',
  })
  @ApiResponse({
    status: 413,
    description: '파일 크기 초과 (최대 10MB)',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB 제한 (환경 변수는 메서드 내에서 검증)
      },
    }),
  )
  async createExcel(
    @UploadedFile() file: MulterFile,
    @Body() options: ExcelRequestDto,
    @Res() res: Response,
    @CurrentUser() user?: User,
    @GuestSession() guestSessionId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (!file.originalname.endsWith('.txt')) {
      throw new BadRequestException('Only .txt files are allowed');
    }

    // 파일 크기 검증 (환경 변수에서 가져온 값 사용)
    const maxFileSize =
      this.configService.get<number>('app.maxFileSize') || 10 * 1024 * 1024;
    if (file.size > maxFileSize) {
      const maxSizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
      throw new BadRequestException(
        `File size exceeds the limit of ${maxSizeMB}MB`,
      );
    }
    console.log(
      `[createExcel Controller] user: ${user ? `id=${user.id}, nickname=${user.nickname}` : 'null'}, guestSessionId: ${guestSessionId || 'null'}`,
    );
    const buffer = await this.jobsService.createExcel(
      file,
      options,
      user?.id,
      guestSessionId,
    );
    const fileName = file.originalname.replace('.txt', '.xlsx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Get('jobs')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '작업 목록 조회',
    description: '로그인 사용자의 변환 작업 목록을 조회합니다.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: '작업 상태 필터',
    enum: ['previewed', 'processing', 'success', 'failed', 'expired'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: '페이지 번호',
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'size',
    required: false,
    description: '페이지 크기',
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: '작업 목록 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
  })
  async getJobs(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('size', new ParseIntPipe({ optional: true })) size = 20,
  ) {
    return this.jobsService.findUserJobs(user.id, status, page, size);
  }

  @UseGuards(JwtAuthGuard)
  @Get('jobs/:jobId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '작업 상세 조회',
    description: '특정 작업의 상세 정보를 조회합니다.',
  })
  @ApiParam({
    name: 'jobId',
    description: '작업 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '작업 상세 조회 성공',
  })
  @ApiResponse({
    status: 404,
    description: '작업을 찾을 수 없음',
  })
  async getJob(@Param('jobId') jobId: string, @CurrentUser() user: User) {
    return this.jobsService.findOne(jobId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('jobs/:jobId/download')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '작업 파일 재다운로드',
    description:
      '이전에 생성한 엑셀 파일을 재다운로드합니다. 파일이 만료되지 않은 경우에만 가능합니다.',
  })
  @ApiParam({
    name: 'jobId',
    description: '작업 ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: '파일 다운로드 성공',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '작업 또는 파일을 찾을 수 없음',
  })
  @ApiResponse({
    status: 410,
    description: '파일이 만료됨 (재생성 필요)',
  })
  async downloadJob(
    @Param('jobId') jobId: string,
    @CurrentUser() user: User,
    @Res() res: Response,
  ) {
    const buffer = await this.jobsService.downloadFile(jobId, user.id);
    const job = await this.jobsService.findOne(jobId, user.id);
    const fileName = job.originalFileName.replace('.txt', '.xlsx');
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(fileName)}"`,
    );
    res.send(buffer);
  }

  @UseGuards(JwtAuthGuard)
  @Post('jobs/claim')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '게스트 작업 귀속',
    description:
      '게스트 모드로 생성한 작업들을 로그인 사용자의 계정으로 귀속시킵니다. 로그인 후 한 번만 호출하면 됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '작업 귀속 성공',
    schema: {
      type: 'object',
      properties: {
        claimed: {
          type: 'number',
          description: '귀속된 작업 개수',
          example: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '게스트 세션을 찾을 수 없음',
  })
  async claimJobs(
    @CurrentUser() user: User,
    @GuestSession() guestSessionId?: string,
  ) {
    if (!guestSessionId) {
      throw new BadRequestException('Guest session not found');
    }
    return this.jobsService.claimGuestJobs(user.id, guestSessionId);
  }
}
