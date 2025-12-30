import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: '사용자 설정 조회',
    description: '현재 로그인한 사용자의 기본 설정을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '설정 조회 성공',
  })
  async getSettings(@CurrentUser() user: User) {
    return this.settingsService.getSettings(user.id);
  }

  @Put()
  @ApiOperation({
    summary: '사용자 설정 업데이트',
    description: '현재 로그인한 사용자의 기본 설정을 업데이트합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '설정 업데이트 성공',
  })
  async updateSettings(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateSettingsDto,
  ) {
    return this.settingsService.updateSettings(user.id, updateDto);
  }
}

