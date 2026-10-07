import { Router } from 'express';
import { categoriesController } from '../controllers/categories.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', categoriesController.getCategories);
categoriesRouter.get('/:slug', categoriesController.getCategoryBySlug);
categoriesRouter.post('/', requireAuth, categoriesController.createCategory);
