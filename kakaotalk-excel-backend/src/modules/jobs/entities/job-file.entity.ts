import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Job } from './job.entity';

@Entity('job_files')
export class JobFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'job_id', type: 'uuid' })
  jobId: string;

  @Column({ name: 'storage_type', length: 50, default: 'local' })
  storageType: string;

  @Column({ name: 'path_or_url', type: 'text' })
  pathOrUrl: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Job, (job) => job.jobFiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job: Job;
}

