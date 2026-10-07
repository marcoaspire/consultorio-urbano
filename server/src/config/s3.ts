import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

const isR2Configured = Boolean(
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY && env.R2_SECRET_KEY
);

if (!isR2Configured) {
  console.warn(
    '⚠️ [Cloudflare R2] Variables R2_ACCOUNT_ID, R2_ACCESS_KEY o R2_SECRET_KEY no provistas. Operando en modo desarrollo / fallback.'
  );
}

export const s3Client = new S3Client({
  region: 'auto',
  endpoint: env.R2_ACCOUNT_ID
    ? `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    : undefined,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY || 'dummy_access_key',
    secretAccessKey: env.R2_SECRET_KEY || 'dummy_secret_key',
  },
});

export function getPublicMediaUrl(key: string): string {
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  if (env.R2_PUBLIC_URL) {
    const base = env.R2_PUBLIC_URL.replace(/\/$/, '');
    return `${base}/${key.replace(/^\//, '')}`;
  }
  if (env.R2_ACCOUNT_ID && env.R2_BUCKET_NAME) {
    return `https://${env.R2_BUCKET_NAME}.${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  }
  return `/media/${key}`;
}
