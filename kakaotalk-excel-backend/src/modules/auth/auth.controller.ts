import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from './decorators/public.decorator';
import { ConfigService } from '@nestjs/config';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: '카카오 로그인 시작',
    description:
      '카카오 OAuth 로그인을 시작합니다. 브라우저에서 직접 접속해야 합니다.',
  })
  async kakaoAuth() {
    // Passport가 자동으로 리다이렉트 처리
  }

  @Public()
  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  @ApiExcludeEndpoint()
  @ApiOperation({
    summary: '카카오 로그인 콜백',
    description:
      '카카오 OAuth 인증 후 콜백을 처리합니다. 개발 환경에서는 JSON으로 토큰을 반환합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그인 성공 (개발 환경)',
    type: LoginResponseDto,
  })
  async kakaoCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const user = req.user as User;

      if (!user) {
        throw new UnauthorizedException('User not found after authentication');
      }

      const { accessToken, refreshToken } = await this.authService.login(user);

      // Refresh Token을 쿠키에 저장
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: this.configService.get('app.nodeEnv') === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7일
      });

      // 개발 환경에서는 JSON으로 토큰 반환 (프론트엔드가 없을 때)
      const nodeEnv = this.configService.get<string>('app.nodeEnv');
      const frontendUrl = this.configService.get<string>('app.frontendUrl');

      // 프론트엔드 URL이 localhost이거나 설정되지 않은 경우 JSON으로 반환
      if (
        nodeEnv === 'development' ||
        !frontendUrl ||
        frontendUrl.includes('localhost')
      ) {
        // 개발 환경 또는 프론트엔드가 없는 경우: JSON으로 토큰 반환
        return res.json({
          success: true,
          message: '로그인 성공! 아래 토큰을 사용하세요.',
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            nickname: user.nickname,
            email: user.email,
            provider: user.provider,
          },
          instructions: {
            step1: '이 토큰을 사용하여 API를 호출할 수 있습니다',
            step2: '프론트엔드가 배포되면 자동으로 리다이렉트됩니다',
            example:
              'GET /auth/me (Header: Authorization: Bearer YOUR_ACCESS_TOKEN)',
          },
        });
      }

      // 프로덕션: 프론트엔드로 리다이렉트
      res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
    } catch (error: unknown) {
      console.error('Kakao callback error:', error);
      const nodeEnv = this.configService.get<string>('app.nodeEnv');
      const frontendUrl = this.configService.get<string>('app.frontendUrl');

      const errorMessage =
        error instanceof Error ? error.message : 'Authentication failed';

      if (nodeEnv === 'development') {
        // 개발 환경: 에러를 JSON으로 반환
        return res.status(500).json({
          success: false,
          error: errorMessage,
        });
      }

      // 프로덕션: 프론트엔드로 에러와 함께 리다이렉트
      res.redirect(
        `${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`,
      );
    }
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '현재 사용자 정보 조회',
    description: 'JWT 토큰을 기반으로 현재 로그인한 사용자 정보를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        nickname: { type: 'string', example: '홍길동' },
        email: { type: 'string', nullable: true, example: 'user@example.com' },
        provider: { type: 'string', example: 'kakao' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 (토큰 없음 또는 만료)',
  })
  getMe(@CurrentUser() user: User) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      nickname: user.nickname,
      email: user.email,
      provider: user.provider,
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Access Token 재발급',
    description:
      'Refresh Token을 사용하여 새로운 Access Token을 발급받습니다. Refresh Token은 httpOnly 쿠키로 자동 관리됩니다.',
  })
  @ApiResponse({
    status: 200,
    description: '토큰 재발급 성공',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh Token이 없거나 유효하지 않음',
  })
  async refresh(@Req() req: Request) {
    const cookies = req.cookies as { refresh_token?: string } | undefined;
    const refreshToken = cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '로그아웃',
    description: '현재 사용자를 로그아웃하고 Refresh Token을 무효화합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '로그아웃 성공',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Logged out successfully' },
      },
    },
  })
  async logout(@CurrentUser() user: User, @Res() res: Response) {
    await this.authService.logout(user.id);
    res.clearCookie('refresh_token');
    return res.json({ message: 'Logged out successfully' });
  }
}
