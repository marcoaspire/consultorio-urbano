import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { storageService } from '../services/storage.service.js';

const presignedUrlSchema = z.object({
  filename: z.string().min(1, 'El nombre de archivo es requerido'),
  contentType: z.string().min(1, 'El tipo MIME es requerido'),
  size: z.number().positive().optional(),
  folder: z.string().optional(),
});

const confirmMediaSchema = z.object({
  analysisId: z.string().uuid().optional(),
  assetType: z
    .enum(['image_before', 'image_after', 'pdf_report', 'video', 'geojson', 'other'])
    .optional(),
  storagePath: z.string().min(1, 'La ruta de almacenamiento es requerida'),
  publicUrl: z.string().optional(),
  mimeType: z.string().min(1, 'El tipo MIME es requerido'),
  fileSizeBytes: z.number().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const mediaController = {
  async getPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = presignedUrlSchema.parse(req.body);
      const result = await storageService.generatePresignedPutUrl(validated);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async confirmUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = confirmMediaSchema.parse(req.body);
      const result = await storageService.confirmMediaUpload(validated);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  // Endpoint de conveniencia para pruebas en entorno de desarrollo local sin R2 activo
  devUpload(req: Request, res: Response): void {
    res.status(200).send('OK (Dev direct upload acknowledged)');
  },
};
