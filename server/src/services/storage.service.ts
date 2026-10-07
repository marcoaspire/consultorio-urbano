import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { s3Client, getPublicMediaUrl } from '../config/s3.js';
import { db } from '../config/db.js';
import type { AnalysisAsset, AssetType } from '../types/index.js';

export const storageService = {
  /**
   * Genera una URL Presigned PUT compatible con Cloudflare R2 / AWS S3 v3
   */
  async generatePresignedPutUrl(params: {
    filename: string;
    contentType: string;
    size?: number;
    folder?: string;
  }): Promise<{ uploadUrl: string; key: string; publicUrl: string; expiresInSeconds: number }> {
    const { filename, contentType, folder = 'analyses' } = params;

    const sanitizedFilename = filename
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9._-]/g, '_');

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const timestamp = Date.now();
    const key = `${folder}/${timestamp}-${randomSuffix}-${sanitizedFilename}`;

    // Si R2 no está completamente configurado (por ejemplo en entorno de pruebas local),
    // devolvemos una URL simulada funcional
    if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY || !env.R2_SECRET_KEY) {
      const publicUrl = `/uploads/${key}`;
      return {
        uploadUrl: `http://localhost:${env.PORT}/api/media/dev-upload?key=${encodeURIComponent(key)}`,
        key,
        publicUrl,
        expiresInSeconds: 900,
      };
    }

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const expiresInSeconds = 900; // 15 minutos
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
    const publicUrl = getPublicMediaUrl(key);

    return {
      uploadUrl,
      key,
      publicUrl,
      expiresInSeconds,
    };
  },

  /**
   * Persiste la referencia de un archivo subido en PostgreSQL (tabla analysis_assets)
   */
  async confirmMediaUpload(data: {
    analysisId?: string;
    assetType?: AssetType;
    storagePath: string;
    publicUrl?: string;
    mimeType: string;
    fileSizeBytes?: number;
    metadata?: Record<string, unknown>;
  }): Promise<AnalysisAsset | { storagePath: string; publicUrl: string; confirmed: boolean }> {
    const publicUrl = data.publicUrl || getPublicMediaUrl(data.storagePath);

    if (data.analysisId) {
      const insertResult = await db.query(
        `INSERT INTO analysis_assets (
          analysis_id, asset_type, storage_path, public_url, mime_type, file_size_bytes, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          data.analysisId,
          data.assetType || 'other',
          data.storagePath,
          publicUrl,
          data.mimeType,
          data.fileSizeBytes || null,
          data.metadata ? JSON.stringify(data.metadata) : null,
        ]
      );

      const row = insertResult.rows[0];
      return {
        id: row.id,
        analysis_id: row.analysis_id,
        asset_type: row.asset_type,
        storage_path: row.storage_path,
        public_url: row.public_url,
        mime_type: row.mime_type,
        file_size_bytes: row.file_size_bytes ? Number(row.file_size_bytes) : undefined,
        metadata: row.metadata || undefined,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at ? row.updated_at.toISOString() : undefined,
        deleted_at: row.deleted_at ? row.deleted_at.toISOString() : null,
      };
    }

    return {
      storagePath: data.storagePath,
      publicUrl,
      confirmed: true,
    };
  },
};
