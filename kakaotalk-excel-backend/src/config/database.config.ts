import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'kakaotalk_excel',
  schema: process.env.DB_SCHEMA || 'public',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL_REQUIRED === 'true' ||
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  sslRequired:
    process.env.DB_SSL === 'true' ||
    process.env.DB_SSL_REQUIRED === 'true' ||
    process.env.NODE_ENV === 'production',
}));

