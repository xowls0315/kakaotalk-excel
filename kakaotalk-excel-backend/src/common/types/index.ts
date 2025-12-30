export interface JwtPayload {
  sub: number;
  email?: string;
  nickname?: string;
}

export interface KakaoProfile {
  id: string;
  username?: string;
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account?: {
    email?: string;
    email_needs_agreement?: boolean;
    is_email_valid?: boolean;
    is_email_verified?: boolean;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
  _raw?: string;
  _json?: any;
}

