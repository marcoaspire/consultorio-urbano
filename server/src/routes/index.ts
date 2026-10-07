import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { categoriesRouter } from './categories.routes.js';
import { projectsRouter } from './projects.routes.js';
import { analysesRouter } from './analyses.routes.js';
import { mediaRouter } from './media.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/projects', projectsRouter);
apiRouter.use('/analyses', analysesRouter);
apiRouter.use('/media', mediaRouter);
