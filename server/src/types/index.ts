export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export type CategoryScope = 'project' | 'analysis' | 'both';

export interface Category {
  slug: string;
  name: string;
  scope: CategoryScope;
  color?: string;
  icon?: string;
  created_at?: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  location: string;
  category_slug: string;
  category?: Category;
  description?: string;
  thumbnail_url?: string;
  analyses_count: number;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  relative_time?: string;
}

export type AssetType =
  | 'image_before'
  | 'image_after'
  | 'pdf_report'
  | 'video'
  | 'geojson'
  | 'other';

export interface AnalysisAsset {
  id: string;
  analysis_id: string;
  asset_type: AssetType;
  storage_path: string;
  public_url?: string;
  mime_type: string;
  file_size_bytes?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
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

export interface Analysis {
  id: string;
  slug: string;
  project_id: string;
  title: string;
  description: string;
  city: string;
  category_slug: string;
  category?: Category;
  thumbnail_url?: string;
  video_url?: string;
  technical_summary?: TechnicalSummary;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  relative_time?: string;
  assets?: AnalysisAsset[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  session: {
    accessToken: string;
    refreshToken: string;
  };
}
