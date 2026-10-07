import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { categoriesService } from '../services/categories.service.js';
import type { CategoryScope } from '../types/index.js';

export const categoriesController = {
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scope = req.query.scope as CategoryScope | undefined;
      const categories = await categoriesService.getCategories(scope);
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  },

  async getCategoryBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const category = await categoriesService.getCategoryBySlug(slug);

      if (!category) {
        res.status(404).json({ error: `Categoría '${slug}' no encontrada.` });
        return;
      }

      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  },

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schema = z.object({
        slug: z.string().min(1),
        name: z.string().min(1),
        scope: z.enum(['project', 'analysis', 'both']),
        color: z.string().optional(),
        icon: z.string().optional(),
      });

      const validated = schema.parse(req.body);
      const created = await categoriesService.createCategory(validated);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },
};
