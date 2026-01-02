import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { sign, verify } from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from '../../common/types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateKakaoUser(kakaoData: {
    providerUserId: string;
    nickname: string;
    email?: string;
  }): Promise<User> {
    try {
      if (!kakaoData.providerUserId) {
        throw new Error('Provider user ID is required');
      }
      if (!kakaoData.nickname) {
        throw new Error('Nickname is required');
      }

      let user = await this.userRepository.findOne({
        where: { providerUserId: kakaoData.providerUserId },
      });

      if (!user) {
        user = this.userRepository.create({
          provider: 'kakao',
          providerUserId: kakaoData.providerUserId,
          nickname: kakaoData.nickname,
          email: kakaoData.email,
        });
        user = await this.userRepository.save(user);
      } else {
        if (
          user.nickname !== kakaoData.nickname ||
          user.email !== kakaoData.email
        ) {
          user.nickname = kakaoData.nickname;
          if (kakaoData.email) {
            user.email = kakaoData.email;
          }
          await this.userRepository.save(user);
        }
      }

      return user;
    } catch (error) {
      console.error('validateKakaoUser error:', error);
      throw error;
    }
  }

  async validateUser(userId: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async login(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };

    const accessExpiresIn =
      this.configService.get<string>('jwt.accessExpiresIn') || '15m';
    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshExpiresIn') || '7d';

    // Access Token 생성
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: accessExpiresIn,
    } as any);

    // Refresh Token 생성 (별도의 secret 사용)
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
    if (!refreshSecret) {
      throw new Error('JWT refresh secret is missing');
    }
    const refreshTokenPayload: { sub: number; type: string } = {
      sub: user.id,
      type: 'refresh',
    };
    const refreshToken = sign(refreshTokenPayload, refreshSecret, {
      expiresIn: refreshExpiresIn,
    } as any);

    // Refresh Token 만료 시간 계산
    const expiresAt = new Date();
    const refreshExpiresInDays = parseInt(
      refreshExpiresIn.replace('d', ''),
      10,
    );
    expiresAt.setDate(expiresAt.getDate() + refreshExpiresInDays);

    // 기존 Refresh Token 삭제
    await this.refreshTokenRepository.delete({ userId: user.id });

    // 새 Refresh Token 저장
    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        nickname: user.nickname,
        email: user.email,
      },
    };
  }

  async refreshToken(refreshTokenString: string) {
    try {
      console.log('[refreshToken] Starting token refresh process');

      // Refresh Token 검증 (별도의 secret 사용)
      const refreshSecret = this.configService.get<string>('jwt.refreshSecret');
      if (!refreshSecret) {
        console.error('[refreshToken] JWT refresh secret is missing');
        throw new UnauthorizedException('JWT refresh secret is missing');
      }

      let payload: { sub: number; type?: string };
      try {
        payload = verify(refreshTokenString, refreshSecret) as unknown as {
          sub: number;
          type?: string;
        };
        console.log('[refreshToken] Token verified, userId:', payload.sub);
      } catch (verifyError) {
        console.error('[refreshToken] Token verification failed:', verifyError);
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (payload.type !== 'refresh') {
        console.error('[refreshToken] Invalid token type:', payload.type);
        throw new UnauthorizedException('Invalid token type');
      }

      // DB에서 Refresh Token 확인
      const storedToken = await this.refreshTokenRepository.findOne({
        where: {
          token: refreshTokenString,
          userId: payload.sub,
        },
        relations: ['user'],
      });

      if (!storedToken) {
        console.error(
          '[refreshToken] Refresh token not found in DB for userId:',
          payload.sub,
        );
        throw new UnauthorizedException('Refresh token not found');
      }

      // 만료 확인
      if (new Date() > storedToken.expiresAt) {
        console.error(
          '[refreshToken] Refresh token expired:',
          storedToken.expiresAt,
        );
        await this.refreshTokenRepository.remove(storedToken);
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = storedToken.user;
      if (!user) {
        console.error('[refreshToken] User not found for stored token');
        throw new UnauthorizedException('User not found');
      }

      console.log(
        '[refreshToken] User found, generating new access token for userId:',
        user.id,
      );

      // 새 Access Token 생성
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        nickname: user.nickname,
      };
      const accessExpiresIn =
        this.configService.get<string>('jwt.accessExpiresIn') || '15m';
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: accessExpiresIn,
      } as any);

      return { accessToken: newAccessToken };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: number) {
    await this.refreshTokenRepository.delete({ userId });
  }

  async cleanupExpiredTokens() {
    await this.refreshTokenRepository.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
