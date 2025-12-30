import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { UserSetting } from '../../settings/entities/user-setting.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, default: 'kakao' })
  provider: string;

  @Column({ name: 'provider_user_id', unique: true, length: 255 })
  providerUserId: string;

  @Column({ nullable: true, length: 255 })
  email?: string;

  @Column({ length: 255 })
  nickname: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Job, (job) => job.user)
  jobs: Job[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => UserSetting, (userSetting) => userSetting.user)
  userSettings: UserSetting[];
}

