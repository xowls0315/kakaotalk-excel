import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { KakaoProfile } from '../../../common/types';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('kakao.clientID');
    const clientSecret = configService.get<string>('kakao.clientSecret');
    const callbackURL = configService.get<string>('kakao.callbackURL');

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Kakao OAuth configuration is missing');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: KakaoProfile,
  ) {
    try {
      // 프로필 전체 구조 디버깅
      console.log('Kakao profile received:', JSON.stringify(profile, null, 2));

      const { id, properties, kakao_account } = profile;

      // 프로필 데이터 검증
      if (!id) {
        throw new Error('Kakao profile ID is missing');
      }

      // nickname 처리 (더 유연하게)
      let nickname = '카카오사용자'; // 기본값
      if (properties?.nickname) {
        nickname = properties.nickname;
      } else if (kakao_account?.profile?.nickname) {
        nickname = kakao_account.profile.nickname;
      } else if (profile.username) {
        nickname = profile.username;
      }

      // email 처리
      const email = kakao_account?.email;

      console.log('Extracted user data:', {
        providerUserId: id.toString(),
        nickname,
        email,
      });

      const user = await this.authService.validateKakaoUser({
        providerUserId: id.toString(),
        nickname,
        email,
      });

      return user;
    } catch (error) {
      console.error('KakaoStrategy validate error:', error);
      console.error('Profile structure:', JSON.stringify(profile, null, 2));
      throw error;
    }
  }
}
