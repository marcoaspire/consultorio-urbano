import type { Category } from './category';

/**
 * Modelos de datos para análisis geoespaciales.
 * Conformes a PostgreSQL agnóstico (analyses + analysis_assets).
 */

export type AssetType =
  | 'image_before'
  | 'image_after'
  | 'pdf_report'
  | 'video'
  | 'geojson'
  | 'other';

/**
 * Tabla dependiente: analysis_assets
 * Almacena archivos asociados (imágenes satelitales de alta resolución, PDF, videos)
 */
export interface AnalysisAsset {
  id: string; // UUID
  analysis_id: string; // UUID
  asset_type: AssetType;
  storage_path: string; // ruta relativa en Object Storage o URL
  public_url?: string; // URL pública resuelta dinámicamente
  mime_type: string;
  file_size_bytes?: number;
  metadata?: {
    label?: string;
    year?: string;
    resolution?: string;
    sensor?: string;
    date_captured?: string;
    area_km2?: number;
    duration_seconds?: number;
    [key: string]: unknown;
  }; // JSONB
  created_at: string; // TIMESTAMPTZ ISO
  updated_at?: string;
  deleted_at?: string | null;
}

export interface TechnicalSummaryPage {
  pageNumber: number;
  title: string;
  content: string;
  metrics: Array<{ label: string; value: string }>;
  tags: string[];
}

export interface TechnicalSummary {
  pdf_filename: string;
  pdf_total_pages: number;
  tags: string[];
  metrics: Array<{ label: string; value: string }>;
  executive_summary?: string;
  pages?: TechnicalSummaryPage[];
}

/**
 * Tabla principal: analyses
 * Metadata descriptiva y relacional del estudio geoespacial
 */
export interface Analysis {
  id: string; // UUID
  slug: string; // Ruta amigable URL
  title: string;
  description: string;
  city: string;
  category_slug: string;
  category?: Category;
  created_at: string; // TIMESTAMPTZ ISO
  updated_at: string; // TIMESTAMPTZ ISO
  deleted_at?: string | null;
  assets?: AnalysisAsset[];
  // Relación con el Nivel 1: Proyecto / Terreno
  project_id: string;
  // Campos auxiliares para renderizado visual y multimedia
  thumbnail_url?: string;
  video_url?: string;
  relative_time?: string;
  technical_summary?: TechnicalSummary;
}

/**
 * Parámetros de consulta para paginación y filtrado en servidor
 */
export interface AnalysisQueryParams {
  page: number; // 1-indexed
  limit: number;
  search?: string;
  category_slug?: string | 'todos';
  sortBy?: 'date_desc' | 'date_asc' | 'title_asc';
  projectSlug?: string; // Filtro por proyecto en Nivel 2
}

/**
 * Contrato de respuesta paginada del backend
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Datos requeridos para crear un nuevo análisis desde el formulario
 */
export interface CreateAnalysisDTO {
  title: string;
  description: string;
  city: string;
  category_slug: string;
  projectSlug?: string;
  projectId?: string;
  videoUrl?: string;
  imageBeforeFile?: File | null;
  imageAfterFile?: File | null;
  pdfReportFile?: File | null;
  videoFile?: File | null;
}
