import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsSchedulerService } from './jobs-scheduler.service';
import { Job } from './entities/job.entity';
import { JobFile } from './entities/job-file.entity';
import { GuestSession } from './entities/guest-session.entity';
import { ParserModule } from '../parser/parser.module';
import { ExcelModule } from '../excel/excel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Job, JobFile, GuestSession]),
    ParserModule,
    ExcelModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, JobsSchedulerService],
  exports: [JobsService],
})
export class JobsModule {}

