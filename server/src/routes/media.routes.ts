import { Router } from 'express';
import { mediaController } from '../controllers/media.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

export const mediaRouter = Router();

// Presigned URL generation for Cloudflare R2 direct uploads
mediaRouter.post('/presigned-url', requireAuth, mediaController.getPresignedUrl);

// Confirm persisted asset reference in database
mediaRouter.post('/confirm', requireAuth, mediaController.confirmUpload);

// Local fallback endpoint for development without live R2 credentials
mediaRouter.put('/dev-upload', mediaController.devUpload);
