/**
 * Modelos de datos para Proyectos / Terrenos (Nivel 1: Portafolio Global).
 * Diseñado conforme a PostgreSQL agnóstico.
 */

export type ProjectCategory =
  | 'topografia'
  | 'movilidad'
  | 'catastro'
  | 'medio_ambiente';

export interface Project {
  id: string; // UUID
  slug: string; // Ruta amigable URL (ej: /proyectos/evaluacion-de-terreno-b-42)
  name: string;
  location: string;
  category: ProjectCategory;
  description?: string;
  thumbnail_url?: string;
  analyses_count: number; // Conteo de entregas disponibles
  created_at: string; // TIMESTAMPTZ ISO
  relative_time?: string;
}

export interface CreateProjectDTO {
  name: string;
  location: string;
  category: ProjectCategory;
  description?: string;
}

export interface ProjectQueryParams {
  search?: string;
  category?: ProjectCategory | 'todos';
}
