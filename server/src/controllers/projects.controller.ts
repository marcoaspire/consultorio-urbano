import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { projectsService } from '../services/projects.service.js';

const createProjectSchema = z.object({
  name: z.string().min(1, 'El nombre del proyecto es obligatorio'),
  location: z.string().min(1, 'La ubicación es obligatoria'),
  category_slug: z.string().min(1, 'La categoría es obligatoria'),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
  category_slug: z.string().optional(),
  description: z.string().optional(),
});

export const projectsController = {
  async getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const category_slug = req.query.category_slug as string | undefined;

      const projects = await projectsService.getProjects({ search, category_slug });
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  },

  async getProjectBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const project = await projectsService.getProjectBySlug(slug);

      if (!project) {
        res.status(404).json({ error: `Proyecto '${slug}' no encontrado.` });
        return;
      }

      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  },

  async createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = createProjectSchema.parse(req.body);
      const project = await projectsService.createProject(validated);
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  },

  async updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validated = updateProjectSchema.parse(req.body);
      const project = await projectsService.updateProject(id, validated);
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  },

  async deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await projectsService.softDeleteProject(id);
      res.status(200).json({ success: true, message: 'Proyecto eliminado lógicamente.' });
    } catch (error) {
      next(error);
    }
  },
};
