/**
 * Modelo de datos agnóstico para Categorías de Proyectos y Análisis.
 * Mapeado desde la tabla PostgreSQL `categories`.
 */

export type CategoryScope = 'project' | 'analysis' | 'both';

export interface Category {
  slug: string; // PRIMARY KEY (ej: 'topografia', 'movilidad_urbana')
  name: string; // Nombre descriptivo en interfaz
  scope: CategoryScope;
  color?: string; // Hexadecimal o clase CSS de color
  icon?: string; // Identificador de ícono Material Symbols
  created_at?: string;
}
