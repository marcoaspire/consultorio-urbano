import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { analysesService } from '../services/analyses.service.js';

const createAnalysisSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  city: z.string().min(1, 'La ciudad es obligatoria'),
  category_slug: z.string().min(1, 'La categoría es obligatoria'),
  projectId: z.string().uuid().optional(),
  projectSlug: z.string().optional(),
  videoUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  technical_summary: z.record(z.unknown()).optional(),
  assets: z
    .array(
      z.object({
        asset_type: z.enum([
          'image_before',
          'image_after',
          'pdf_report',
          'video',
          'geojson',
          'other',
        ]),
        storage_path: z.string().min(1),
        public_url: z.string().optional(),
        mime_type: z.string().min(1),
        file_size_bytes: z.number().optional(),
        metadata: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
});

const updateAnalysisSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  category_slug: z.string().optional(),
  videoUrl: z.string().optional(),
});

export const analysesController = {
  async getAnalyses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 8;
      const search = req.query.search as string | undefined;
      const category_slug = req.query.category_slug as string | undefined;
      const projectSlug = req.query.projectSlug as string | undefined;

      const response = await analysesService.getAnalyses({
        page,
        limit,
        search,
        category_slug,
        projectSlug,
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },

  async getAnalysisBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const analysis = await analysesService.getAnalysisBySlug(slug);

      if (!analysis) {
        res.status(404).json({ error: `Análisis '${slug}' no encontrado.` });
        return;
      }

      res.status(200).json(analysis);
    } catch (error) {
      next(error);
    }
  },

  async createAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createAnalysisSchema.parse(req.body);
      const created = await analysesService.createAnalysis(validated);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },

  async updateAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validated = updateAnalysisSchema.parse(req.body);
      const updated = await analysesService.updateAnalysis(id, validated);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await analysesService.softDeleteAnalysis(id);
      res.status(200).json({ success: true, message: 'Análisis eliminado lógicamente.' });
    } catch (error) {
      next(error);
    }
  },
};
