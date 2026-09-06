import type { Category } from './category';

/**
 * Modelos de datos para Proyectos / Terrenos (Nivel 1: Portafolio Global).
 * Diseñado conforme a PostgreSQL agnóstico.
 */

export interface Project {
  id: string; // UUID
  slug: string; // Ruta amigable URL
  name: string;
  location: string;
  category_slug: string;
  category?: Category;
  description?: string;
  thumbnail_url?: string;
  analyses_count: number; // Conteo de entregas disponibles
  created_at: string; // TIMESTAMPTZ ISO
  updated_at?: string; // TIMESTAMPTZ ISO
  deleted_at?: string | null; // Soft delete timestamp
  relative_time?: string;
}

export interface CreateProjectDTO {
  name: string;
  location: string;
  category_slug: string;
  description?: string;
}

export interface ProjectQueryParams {
  search?: string;
  category_slug?: string | 'todos';
}
