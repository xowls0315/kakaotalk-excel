import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { GuestSession } from './guest-session.entity';
import { JobFile } from './job-file.entity';

export enum JobStatus {
  PREVIEWED = 'previewed',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @Column({ name: 'guest_session_id', type: 'uuid', nullable: true })
  guestSessionId?: string;

  @Column({ name: 'original_file_name', length: 500 })
  originalFileName: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: JobStatus.PREVIEWED,
  })
  status: JobStatus;

  @Column({ name: 'options_json', type: 'jsonb', nullable: true })
  optionsJson?: any;

  @Column({ name: 'room_name', nullable: true, length: 255 })
  roomName?: string;

  @Column({ name: 'total_messages', nullable: true })
  totalMessages?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt?: Date;

  @ManyToOne(() => User, (user) => user.jobs, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @ManyToOne(() => GuestSession, (guestSession) => guestSession.jobs, {
    nullable: true,
  })
  @JoinColumn({ name: 'guest_session_id' })
  guestSession?: GuestSession;

  @OneToMany(() => JobFile, (jobFile) => jobFile.job)
  jobFiles: JobFile[];
}

