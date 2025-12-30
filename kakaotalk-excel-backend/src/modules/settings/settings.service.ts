import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSetting } from './entities/user-setting.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSetting)
    private settingsRepository: Repository<UserSetting>,
  ) {}

  async getSettings(userId: number): Promise<UserSetting> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      // 기본 설정 생성
      const newSettings = this.settingsRepository.create({
        userId,
        defaultIncludeSystem: false,
        defaultSplitSheetsByDay: false,
        defaultDateRangeDays: undefined,
      });
      settings = await this.settingsRepository.save(newSettings);
    }

    if (!settings) {
      throw new Error('Failed to create user settings');
    }

    return settings;
  }

  async updateSettings(
    userId: number,
    updateDto: UpdateSettingsDto,
  ): Promise<UserSetting> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });

    if (!settings) {
      settings = this.settingsRepository.create({
        userId,
        ...updateDto,
      });
    } else {
      Object.assign(settings, updateDto);
    }

    return this.settingsRepository.save(settings);
  }
}

