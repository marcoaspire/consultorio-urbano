import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled Application Error:', err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Error de validación en la solicitud.',
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      error: err.message || 'Error interno del servidor.',
    });
    return;
  }

  res.status(500).json({
    error: 'Error inesperado del servidor.',
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Ruta no encontrada en la API.' });
}
