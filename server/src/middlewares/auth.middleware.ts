import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Acceso no autorizado. Token Bearer requerido.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
      firstname?: string;
      lastname?: string;
    };

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'El token ha expirado.', code: 'TOKEN_EXPIRED' });
      return;
    }
    res.status(401).json({ error: 'Token inválido o malformado.' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
      firstname?: string;
      lastname?: string;
    };

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      firstname: decoded.firstname,
      lastname: decoded.lastname,
    };
  } catch {
    // Si el token es inválido en modo opcional, se continúa como anónimo
  }

  next();
}
