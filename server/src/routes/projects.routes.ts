import { Router } from 'express';
import { projectsController } from '../controllers/projects.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const projectsRouter = Router();

projectsRouter.get('/', projectsController.getProjects);
projectsRouter.get('/:slug', projectsController.getProjectBySlug);
projectsRouter.post('/', requireAuth, projectsController.createProject);
projectsRouter.put('/:id', requireAuth, projectsController.updateProject);
projectsRouter.delete('/:id', requireAuth, projectsController.deleteProject);
