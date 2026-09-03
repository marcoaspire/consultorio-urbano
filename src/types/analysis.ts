/**
 * Modelos de datos para análisis geoespaciales.
 * Conformes a PostgreSQL agnóstico (analyses + analysis_assets).
 */

export type AnalysisCategory =
  | 'movilidad'
  | 'topografia'
  | 'demografia'
  | 'medio_ambiente'
  | 'catastro';

export type AnalysisStatus = 'activo' | 'completado' | 'en_proceso';

export type AssetType =
  | 'image_before'
  | 'image_after'
  | 'pdf_report'
  | 'geojson'
  | 'other';

/**
 * Tabla dependiente: analysis_assets
 * Almacena archivos asociados (imágenes satelitales de alta resolución, PDF)
 */
export interface AnalysisAsset {
  id: string; // UUID
  analysis_id: string; // UUID
  asset_type: AssetType;
  storage_path: string; // ruta relativa en Object Storage o URL
  mime_type: string;
  file_size_bytes?: number;
  metadata?: {
    label?: string;
    year?: string;
    resolution?: string;
    sensor?: string;
    date_captured?: string;
    area_km2?: number;
    [key: string]: unknown;
  }; // JSONB
  created_at: string; // TIMESTAMPTZ ISO
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
  slug: string; // Ruta amigable URL (ej: /analisis/evaluacion-de-terreno-b-42)
  title: string;
  description: string;
  city: string;
  quadrant?: string; // ej: 'Cuadrante Norte'
  category: AnalysisCategory;
  status: AnalysisStatus;
  created_at: string; // TIMESTAMPTZ ISO
  updated_at: string; // TIMESTAMPTZ ISO
  assets?: AnalysisAsset[];
  // Campos auxiliares para renderizado visual
  thumbnail_url?: string;
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
  category?: AnalysisCategory | 'todos';
  status?: AnalysisStatus | 'todos';
  sortBy?: 'date_desc' | 'date_asc' | 'title_asc';
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
  quadrant?: string;
  category: AnalysisCategory;
  imageBeforeFile?: File | null;
  imageAfterFile?: File | null;
  pdfReportFile?: File | null;
}

