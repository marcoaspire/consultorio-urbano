import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // PostgreSQL
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/consultorio_urbano',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_consultorio_urbano_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  // Cloudflare R2 / S3
  R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
  R2_ACCESS_KEY: process.env.R2_ACCESS_KEY || '',
  R2_SECRET_KEY: process.env.R2_SECRET_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || 'consultorio-urbano-assets',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '',
};
