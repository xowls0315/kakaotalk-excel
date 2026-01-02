import { registerAs } from '@nestjs/config';

export default registerAs('database', () => {
  // 프로덕션 환경 감지 (app.config.ts와 동일한 로직)
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
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'kakaotalk_excel',
    schema: process.env.DB_SCHEMA || 'public',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: !isProduction, // 프로덕션에서는 false
    logging: !isProduction, // 프로덕션에서는 false
    ssl:
      process.env.DB_SSL === 'true' ||
      process.env.DB_SSL_REQUIRED === 'true' ||
      isProduction
        ? { rejectUnauthorized: false }
        : false,
    sslRequired:
      process.env.DB_SSL === 'true' ||
      process.env.DB_SSL_REQUIRED === 'true' ||
      isProduction,
  };
});
