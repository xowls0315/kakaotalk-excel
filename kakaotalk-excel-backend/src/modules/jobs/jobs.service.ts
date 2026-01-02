import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import * as path from 'path';

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
import { Job, JobStatus } from './entities/job.entity';
import { JobFile } from './entities/job-file.entity';
import { GuestSession } from './entities/guest-session.entity';
import { ParserService } from '../parser/parser.service';
import { ExcelService } from '../excel/excel.service';
import { PreviewRequestDto } from './dto/preview-request.dto';
import { ExcelRequestDto } from './dto/excel-request.dto';

/**
 * 한국 시간대(KST, UTC+9)로 ISO 문자열을 생성하는 유틸리티 함수
 */
function toKSTISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+09:00`;
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(JobFile)
    private jobFileRepository: Repository<JobFile>,
    @InjectRepository(GuestSession)
    private guestSessionRepository: Repository<GuestSession>,
    private parserService: ParserService,
    private excelService: ExcelService,
    private configService: ConfigService,
  ) {}

  async getOrCreateGuestSession(guestSessionId: string): Promise<GuestSession> {
    let session = await this.guestSessionRepository.findOne({
      where: { id: guestSessionId },
    });

    if (!session) {
      session = this.guestSessionRepository.create({
        id: guestSessionId,
        lastSeenAt: new Date(),
      });
      session = await this.guestSessionRepository.save(session);
    } else {
      session.lastSeenAt = new Date();
      await this.guestSessionRepository.save(session);
    }

    return session;
  }

  async createPreview(
    file: MulterFile,
    options: PreviewRequestDto,
    userId?: number,
    guestSessionId?: string,
  ) {
    const fileContent = file.buffer.toString('utf-8');
    const parsed = this.parserService.parseKakaoTalkFile(fileContent, options);

    let guestSession: GuestSession | null = null;
    if (guestSessionId && !userId) {
      guestSession = await this.getOrCreateGuestSession(guestSessionId);
    }

    const job = this.jobRepository.create({
      originalFileName: file.originalname,
      status: JobStatus.PREVIEWED,
      optionsJson: options,
      roomName: parsed.roomName,
      totalMessages: parsed.messages.length,
    });

    if (userId) {
      job.userId = userId;
    }
    if (guestSession) {
      job.guestSessionId = guestSession.id;
    }

    const savedJob = await this.jobRepository.save(job);
    const previewMessages = this.parserService.getPreview(parsed.messages, 200);

    return {
      jobId: savedJob.id,
      roomName: parsed.roomName,
      messages: previewMessages.map((msg) => ({
        at: toKSTISOString(msg.at),
        sender: msg.sender,
        message: msg.message,
        type: msg.type,
      })),
      participants: parsed.participants,
      stats: {
        totalLines: parsed.messages.length,
        previewCount: previewMessages.length,
      },
    };
  }

  async createExcel(
    file: MulterFile,
    options: ExcelRequestDto,
    userId?: number,
    guestSessionId?: string,
  ): Promise<Buffer> {
    const fileContent = file.buffer.toString('utf-8');
    const parsed = this.parserService.parseKakaoTalkFile(fileContent, options);

    let guestSession: GuestSession | null = null;
    if (guestSessionId && !userId) {
      guestSession = await this.getOrCreateGuestSession(guestSessionId);
    }

    // 기존 preview된 job 찾기
    const whereCondition: any = {
      originalFileName: file.originalname,
      status: JobStatus.PREVIEWED,
    };
    if (userId) {
      whereCondition.userId = userId;
    } else if (guestSession) {
      whereCondition.guestSessionId = guestSession.id;
    }

    let job = await this.jobRepository.findOne({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });

    if (!job) {
      job = this.jobRepository.create({
        originalFileName: file.originalname,
        status: JobStatus.PROCESSING,
        optionsJson: options,
        roomName: parsed.roomName,
        totalMessages: parsed.messages.length,
      });
      if (userId) {
        job.userId = userId;
        console.log(`[createExcel] Creating job for userId: ${userId}`);
      }
      if (guestSession) {
        job.guestSessionId = guestSession.id;
        console.log(
          `[createExcel] Creating job for guestSession: ${guestSession.id}`,
        );
      }
      job = await this.jobRepository.save(job);
      console.log(
        `[createExcel] Job created with id: ${job.id}, userId: ${job.userId}, guestSessionId: ${job.guestSessionId}`,
      );
    } else {
      job.status = JobStatus.PROCESSING;
      job.optionsJson = options;
      job.roomName = parsed.roomName;
      job.totalMessages = parsed.messages.length;
      await this.jobRepository.save(job);
    }

    try {
      const workbook = await this.excelService.createExcel(
        parsed.messages,
        parsed.roomName,
        options,
      );
      const buffer = await this.excelService.workbookToBuffer(workbook);

      const storagePath =
        this.configService.get<string>('app.storagePath') || './uploads';
      const expiresInDays =
        this.configService.get<number>('app.fileExpiresInDays') || 7;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      await fs.mkdir(storagePath, { recursive: true });
      const fileName = `${job.id}.xlsx`;
      const filePath = path.join(storagePath, fileName);
      await fs.writeFile(filePath, buffer);

      const jobFile = this.jobFileRepository.create({
        jobId: job.id,
        storageType: 'local',
        pathOrUrl: filePath,
        sizeBytes: buffer.length,
        expiresAt,
      });
      await this.jobFileRepository.save(jobFile);

      job.status = JobStatus.SUCCESS;
      job.finishedAt = new Date();
      await this.jobRepository.save(job);

      return buffer;
    } catch (error: any) {
      job.status = JobStatus.FAILED;
      job.finishedAt = new Date();
      await this.jobRepository.save(job);
      throw new BadRequestException('Excel 생성 실패: ' + error.message);
    }
  }

  async findUserJobs(userId: number, status?: string, page = 1, size = 20) {
    try {
      // 입력 검증
      if (!userId || typeof userId !== 'number' || userId <= 0) {
        console.error('[findUserJobs] Invalid userId:', userId);
        throw new BadRequestException('Invalid user ID');
      }

      if (page < 1) {
        throw new BadRequestException('Page must be greater than 0');
      }

      if (size < 1 || size > 100) {
        throw new BadRequestException('Size must be between 1 and 100');
      }

      console.log(
        `[findUserJobs] Searching for jobs with userId: ${userId}, status: ${status || 'all'}`,
      );

      const query = this.jobRepository
        .createQueryBuilder('job')
        .leftJoinAndSelect('job.jobFiles', 'files')
        .where('job.userId = :userId', { userId })
        .orderBy('job.createdAt', 'DESC');

      if (status) {
        // 상태 검증
        const validStatuses = [
          'previewed',
          'processing',
          'success',
          'failed',
          'expired',
        ];
        if (!validStatuses.includes(status)) {
          throw new BadRequestException(
            `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          );
        }
        query.andWhere('job.status = :status', { status });
      }

      const skip = (page - 1) * size;
      const [jobs, total] = await query.skip(skip).take(size).getManyAndCount();

      console.log(`[findUserJobs] Found ${total} jobs for userId: ${userId}`);
      if (jobs.length > 0) {
        console.log(
          `[findUserJobs] First job: id=${jobs[0].id}, userId=${jobs[0].userId}, status=${jobs[0].status}`,
        );
      }

      return {
        jobs: jobs.map((job) => ({
          id: job.id,
          originalFileName: job.originalFileName,
          status: job.status,
          roomName: job.roomName,
          totalMessages: job.totalMessages,
          createdAt: job.createdAt,
          finishedAt: job.finishedAt,
          hasFile: job.jobFiles && job.jobFiles.length > 0,
          fileExpiresAt: job.jobFiles?.[0]?.expiresAt,
        })),
        total,
        page,
        size,
      };
    } catch (error) {
      console.error('[findUserJobs] Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      // 데이터베이스 에러 등
      throw new BadRequestException(
        'Failed to retrieve jobs. Please try again later.',
      );
    }
  }

  async findOne(jobId: string, userId?: number) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['jobFiles'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (userId && job.userId !== userId) {
      throw new NotFoundException('Job not found');
    }

    return {
      id: job.id,
      originalFileName: job.originalFileName,
      status: job.status,
      optionsJson: job.optionsJson,
      roomName: job.roomName,
      totalMessages: job.totalMessages,
      createdAt: job.createdAt,
      finishedAt: job.finishedAt,
      files: job.jobFiles?.map((file) => ({
        id: file.id,
        sizeBytes: file.sizeBytes,
        expiresAt: file.expiresAt,
        createdAt: file.createdAt,
      })),
    };
  }

  async downloadFile(jobId: string, userId: number): Promise<Buffer> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['jobFiles'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (userId && job.userId !== userId) {
      throw new NotFoundException('Job not found');
    }

    if (!job.jobFiles || job.jobFiles.length === 0) {
      throw new NotFoundException('File not found');
    }

    const jobFile = job.jobFiles[0];
    if (new Date() > jobFile.expiresAt) {
      job.status = JobStatus.EXPIRED;
      await this.jobRepository.save(job);
      throw new BadRequestException('File has expired');
    }

    try {
      const buffer = await fs.readFile(jobFile.pathOrUrl);
      return buffer;
    } catch (error) {
      throw new NotFoundException('File not found on disk');
    }
  }

  async claimGuestJobs(userId: number, guestSessionId: string) {
    const jobs = await this.jobRepository.find({
      where: {
        guestSessionId,
        userId: null as any,
      },
    });

    if (jobs.length === 0) {
      return { claimed: 0 };
    }

    for (const job of jobs) {
      job.userId = userId;
      job.guestSessionId = null as any;
      await this.jobRepository.save(job);
    }

    return { claimed: jobs.length };
  }
}
