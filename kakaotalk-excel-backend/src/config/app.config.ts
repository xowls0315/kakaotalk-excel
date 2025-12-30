import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  storageType: process.env.STORAGE_TYPE || 'local',
  storagePath: process.env.STORAGE_PATH || './uploads',
  fileExpiresInDays: parseInt(process.env.FILE_EXPIRES_IN_DAYS || '7', 10),
  guestSessionExpiresInDays: parseInt(
    process.env.GUEST_SESSION_EXPIRES_IN_DAYS || '7',
    10,
  ),
}));
