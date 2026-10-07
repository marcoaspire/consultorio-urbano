import { Router } from 'express';
import { analysesController } from '../controllers/analyses.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const analysesRouter = Router();

analysesRouter.get('/', analysesController.getAnalyses);
analysesRouter.get('/:slug', analysesController.getAnalysisBySlug);
analysesRouter.post('/', requireAuth, analysesController.createAnalysis);
analysesRouter.put('/:id', requireAuth, analysesController.updateAnalysis);
analysesRouter.delete('/:id', requireAuth, analysesController.deleteAnalysis);
