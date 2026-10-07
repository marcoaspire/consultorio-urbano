import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from '../services/auth.service.js';

const registerSchema = z.object({
  firstname: z.string().min(1, 'El nombre es obligatorio'),
  lastname: z.string().min(1, 'El apellido es obligatorio'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token requerido'),
});

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = registerSchema.parse(req.body);
      const { user, tokens } = await authService.register(validated);

      res.status(201).json({
        user,
        session: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const { user, tokens } = await authService.login(validated);

      res.status(200).json({
        user,
        session: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshSchema.parse(req.body);
      const tokens = await authService.refreshToken(refreshToken);

      res.status(200).json({
        session: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.body?.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.status(200).json({ message: 'Sesión cerrada exitosamente.' });
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'No autenticado' });
        return;
      }

      const user = await authService.getProfile(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  },
};
