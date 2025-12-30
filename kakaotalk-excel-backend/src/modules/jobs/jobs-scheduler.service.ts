import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JobFile } from './entities/job-file.entity';
import { Job, JobStatus } from './entities/job.entity';
import * as fs from 'fs/promises';

@Injectable()
export class JobsSchedulerService {
  private readonly logger = new Logger(JobsSchedulerService.name);

  constructor(
    @InjectRepository(JobFile)
    private jobFileRepository: Repository<JobFile>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredFiles() {
    this.logger.log('Starting expired files cleanup...');
    const now = new Date();
    const expiredFiles = await this.jobFileRepository.find({
      where: {
        expiresAt: LessThan(now),
      },
      relations: ['job'],
    });

    let deletedCount = 0;
    let errorCount = 0;

    for (const file of expiredFiles) {
      try {
        if (file.storageType === 'local') {
          try {
            await fs.unlink(file.pathOrUrl);
          } catch (error) {
            this.logger.warn(`File not found: ${file.pathOrUrl}`);
          }
        }

        if (file.job) {
          file.job.status = JobStatus.EXPIRED;
          await this.jobRepository.save(file.job);
        }

        await this.jobFileRepository.remove(file);
        deletedCount++;
      } catch (error: any) {
        this.logger.error(`Error deleting file ${file.id}: ${error.message}`);
        errorCount++;
      }
    }

    this.logger.log(
      `Cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`,
    );
  }
}

