import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class AuthSchedulerService {
  private readonly logger = new Logger(AuthSchedulerService.name);

  constructor(private authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredRefreshTokens() {
    this.logger.log('Starting expired refresh tokens cleanup...');
    try {
      await this.authService.cleanupExpiredTokens();
      this.logger.log('Expired refresh tokens cleanup completed');
    } catch (error: any) {
      this.logger.error(
        `Error cleaning up expired refresh tokens: ${error.message}`,
      );
    }
  }
}

