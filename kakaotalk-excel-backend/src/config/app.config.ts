import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  // 프로덕션 환경 감지: NODE_ENV 또는 Render 환경 변수 체크
  // Render에서는 NODE_ENV를 설정하지 않아도 RENDER 환경 변수가 자동으로 설정됨
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isRender =
    process.env.RENDER === 'true' ||
    !!process.env.RENDER_EXTERNAL_URL ||
    !!process.env.RENDER_SERVICE_NAME;
  const isProduction =
    nodeEnv === 'production' ||
    isRender ||
    process.env.IS_PRODUCTION === 'true';

  return {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: isProduction ? 'production' : 'development',
    isProduction, // 명시적인 프로덕션 플래그 (NODE_ENV 없이도 사용 가능)
    frontendUrl: process.env.FRONTEND_URL,
    storageType: process.env.STORAGE_TYPE || 'local',
    storagePath: process.env.STORAGE_PATH || './uploads',
    fileExpiresInDays: parseInt(process.env.FILE_EXPIRES_IN_DAYS || '7', 10),
    guestSessionExpiresInDays: parseInt(
      process.env.GUEST_SESSION_EXPIRES_IN_DAYS || '7',
      10,
    ),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 기본 10MB (10 * 1024 * 1024 bytes)
  };
});
