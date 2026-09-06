import { supabase } from '../lib/supabase';
import type {
  Analysis,
  AnalysisAsset,
  AnalysisCategory,
  AnalysisQueryParams,
  CreateAnalysisDTO,
  PaginatedResponse,
} from '../types/analysis';

/**
 * Formatea una fecha ISO a texto relativo en español.
 */
function formatRelativeDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Hace unos momentos';
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} sem`;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Servicio conectado a Supabase para la consulta y creación de análisis geoespaciales.
 * Delega la paginación, conteos y filtrado al backend (PostgreSQL en Supabase)
 * con soporte de Soft Delete en todas las tablas.
 */
export const analysesService = {
  /**
   * Obtiene la lista paginada de análisis con filtros opcionales ejecutados en Supabase.
   */
  async getAnalyses(
    params: AnalysisQueryParams
  ): Promise<PaginatedResponse<Analysis>> {
    const {
      page = 1,
      limit = 8,
      search = '',
      category = 'todos',
      projectSlug,
    } = params;

    const from = (Math.max(1, page) - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('analyses')
      .select('*, assets:analysis_assets(*)', { count: 'exact' })
      .is('deleted_at', null);

    // Filtro por proyecto (Nivel 2)
    if (projectSlug) {
      query = query.eq('project_slug', projectSlug.toLowerCase());
    }

    // Filtro por categoría en base de datos
    if (category && category !== 'todos') {
      query = query.eq('category', category);
    }

    // Filtro textual por búsqueda (título, descripción, ciudad) en base de datos
    if (search.trim()) {
      const term = search.trim();
      query = query.or(
        `title.ilike.%${term}%,description.ilike.%${term}%,city.ilike.%${term}%`
      );
    }

    // Paginación y ordenación en el backend
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('Error fetching analyses from Supabase:', error);
      throw error;
    }

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const validPage = Math.min(Math.max(1, page), totalPages);

    const mappedData: Analysis[] = (data || []).map((row) => {
      // Filtrar assets activos (soft delete)
      const rawAssets = Array.isArray(row.assets) ? row.assets : [];
      const activeAssets: AnalysisAsset[] = rawAssets
        .filter((asset: AnalysisAsset) => !asset.deleted_at)
        .map((asset: AnalysisAsset) => ({
          id: asset.id,
          analysis_id: asset.analysis_id,
          asset_type: asset.asset_type,
          storage_path: asset.storage_path,
          mime_type: asset.mime_type,
          file_size_bytes: asset.file_size_bytes,
          metadata: asset.metadata,
          created_at: asset.created_at,
          updated_at: asset.updated_at,
          deleted_at: asset.deleted_at,
        }));

      // Extraer miniatura
      const afterAsset = activeAssets.find((a) => a.asset_type === 'image_after');
      const thumb =
        row.thumbnail_url ||
        afterAsset?.storage_path ||
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80';

      return {
        id: row.id,
        slug: row.slug,
        project_id: row.project_id,
        project_slug: row.project_slug,
        title: row.title,
        description: row.description,
        city: row.city,
        quadrant: row.quadrant || undefined,
        category: row.category as AnalysisCategory,
        thumbnail_url: thumb,
        video_url: row.video_url || undefined,
        technical_summary: row.technical_summary || undefined,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        relative_time: formatRelativeDate(row.created_at),
        assets: activeAssets,
      };
    });

    return {
      data: mappedData,
      total,
      page: validPage,
      limit,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    };
  },

  /**
   * Obtiene un análisis específico por su UUID desde Supabase.
   */
  async getAnalysisById(id: string): Promise<Analysis | null> {
    const { data, error } = await supabase
      .from('analyses')
      .select('*, assets:analysis_assets(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error fetching analysis by ID:', error);
      throw error;
    }

    if (!data) return null;

    const rawAssets = Array.isArray(data.assets) ? data.assets : [];
    const activeAssets: AnalysisAsset[] = rawAssets
      .filter((asset: AnalysisAsset) => !asset.deleted_at)
      .map((asset: AnalysisAsset) => ({
        id: asset.id,
        analysis_id: asset.analysis_id,
        asset_type: asset.asset_type,
        storage_path: asset.storage_path,
        mime_type: asset.mime_type,
        file_size_bytes: asset.file_size_bytes,
        metadata: asset.metadata,
        created_at: asset.created_at,
        updated_at: asset.updated_at,
        deleted_at: asset.deleted_at,
      }));

    return {
      id: data.id,
      slug: data.slug,
      project_id: data.project_id,
      project_slug: data.project_slug,
      title: data.title,
      description: data.description,
      city: data.city,
      quadrant: data.quadrant || undefined,
      category: data.category as AnalysisCategory,
      thumbnail_url: data.thumbnail_url || undefined,
      video_url: data.video_url || undefined,
      technical_summary: data.technical_summary || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      relative_time: formatRelativeDate(data.created_at),
      assets: activeAssets,
    };
  },

  /**
   * Obtiene un análisis específico por su slug amigable URL desde Supabase.
   */
  async getAnalysisBySlug(slug: string): Promise<Analysis | null> {
    const { data, error } = await supabase
      .from('analyses')
      .select('*, assets:analysis_assets(*)')
      .eq('slug', slug.toLowerCase())
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error fetching analysis by slug:', error);
      throw error;
    }

    if (!data) return null;

    const rawAssets = Array.isArray(data.assets) ? data.assets : [];
    const activeAssets: AnalysisAsset[] = rawAssets
      .filter((asset: AnalysisAsset) => !asset.deleted_at)
      .map((asset: AnalysisAsset) => ({
        id: asset.id,
        analysis_id: asset.analysis_id,
        asset_type: asset.asset_type,
        storage_path: asset.storage_path,
        mime_type: asset.mime_type,
        file_size_bytes: asset.file_size_bytes,
        metadata: asset.metadata,
        created_at: asset.created_at,
        updated_at: asset.updated_at,
        deleted_at: asset.deleted_at,
      }));

    return {
      id: data.id,
      slug: data.slug,
      project_id: data.project_id,
      project_slug: data.project_slug,
      title: data.title,
      description: data.description,
      city: data.city,
      quadrant: data.quadrant || undefined,
      category: data.category as AnalysisCategory,
      thumbnail_url: data.thumbnail_url || undefined,
      video_url: data.video_url || undefined,
      technical_summary: data.technical_summary || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      relative_time: formatRelativeDate(data.created_at),
      assets: activeAssets,
    };
  },

  /**
   * Publica un nuevo análisis en Supabase e inserta sus archivos y video asociados.
   */
  async createAnalysis(
    dto: CreateAnalysisDTO,
    onProgress?: (progress: number) => void
  ): Promise<Analysis> {
    if (onProgress) onProgress(20);

    const baseSlug = dto.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    // Rutas para imágenes (ObjectURL local para visualización inmediata en sesión o enlace externo)
    const beforeUrl = dto.imageBeforeFile
      ? URL.createObjectURL(dto.imageBeforeFile)
      : 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80';

    const afterUrl = dto.imageAfterFile
      ? URL.createObjectURL(dto.imageAfterFile)
      : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';

    const pdfFilename = dto.pdfReportFile?.name || 'Reporte_Tecnico_Oficial.pdf';
    const pdfUrl = dto.pdfReportFile
      ? URL.createObjectURL(dto.pdfReportFile)
      : `analyses/${slug}/${pdfFilename}`;

    // Obtener videoUrl si se especificó URL o archivo de video
    let videoUrl = dto.videoUrl?.trim() || null;
    if (dto.videoFile && !videoUrl) {
      videoUrl = URL.createObjectURL(dto.videoFile);
    }

    if (onProgress) onProgress(40);

    // Buscar project_id correspondiente a projectSlug si existe
    let projectId: string | null = null;
    const projectSlug = dto.projectSlug || 'evaluacion-de-terreno-b-42';

    const { data: projectData } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', projectSlug)
      .maybeSingle();

    if (projectData?.id) {
      projectId = projectData.id;
    }

    if (onProgress) onProgress(60);

    const technicalSummary = {
      pdf_filename: pdfFilename,
      pdf_total_pages: 8,
      tags: ['Recién Publicado', 'Alta Prioridad'],
      metrics: [
        { label: 'Resolución', value: 'Sub-métrica' },
        { label: 'Estado de carga', value: 'Verificado' },
        { label: 'Procesamiento', value: 'Completado' },
      ],
      executive_summary: dto.description.trim(),
    };

    // 1. Insertar el análisis principal en Supabase
    const { data: createdAnalysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        slug,
        project_id: projectId,
        project_slug: projectSlug,
        title: dto.title.trim(),
        description: dto.description.trim(),
        city: dto.city.trim(),
        quadrant: dto.quadrant?.trim() || 'Sector Central',
        category: dto.category,
        thumbnail_url: afterUrl,
        video_url: videoUrl,
        technical_summary: technicalSummary,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting analysis into Supabase:', insertError);
      throw insertError;
    }

    if (onProgress) onProgress(80);

    // 2. Preparar e insertar assets asociados
    const assetsToInsert: Array<{
      analysis_id: string;
      asset_type: import('../types/analysis').AssetType;
      storage_path: string;
      mime_type: string;
      file_size_bytes?: number;
      metadata?: Record<string, unknown>;
    }> = [
      {
        analysis_id: createdAnalysis.id,
        asset_type: 'image_before',
        storage_path: beforeUrl,
        mime_type: dto.imageBeforeFile?.type || 'image/jpeg',
        file_size_bytes: dto.imageBeforeFile?.size || 1024 * 1024 * 2,
        metadata: {
          label: 'Histórico (Previa)',
          year: String(new Date().getFullYear() - 2),
        },
      },
      {
        analysis_id: createdAnalysis.id,
        asset_type: 'image_after',
        storage_path: afterUrl,
        mime_type: dto.imageAfterFile?.type || 'image/jpeg',
        file_size_bytes: dto.imageAfterFile?.size || 1024 * 1024 * 3,
        metadata: {
          label: 'Actual (Reciente)',
          year: String(new Date().getFullYear()),
        },
      },
    ];

    if (dto.pdfReportFile || pdfUrl) {
      assetsToInsert.push({
        analysis_id: createdAnalysis.id,
        asset_type: 'pdf_report',
        storage_path: pdfUrl,
        mime_type: dto.pdfReportFile?.type || 'application/pdf',
        file_size_bytes: dto.pdfReportFile?.size || 1024 * 1024 * 4,
        metadata: { pages: 8 },
      });
    }

    if (videoUrl) {
      assetsToInsert.push({
        analysis_id: createdAnalysis.id,
        asset_type: 'video',
        storage_path: videoUrl,
        mime_type: dto.videoFile?.type || 'video/mp4',
        file_size_bytes: dto.videoFile?.size || 1024 * 1024 * 10,
        metadata: { label: 'Recorrido en Video' },
      });
    }

    const { data: createdAssets, error: assetsError } = await supabase
      .from('analysis_assets')
      .insert(assetsToInsert)
      .select();

    if (assetsError) {
      console.warn('Warning inserting analysis assets:', assetsError);
    }

    if (onProgress) onProgress(100);

    return {
      id: createdAnalysis.id,
      slug: createdAnalysis.slug,
      project_id: createdAnalysis.project_id,
      project_slug: createdAnalysis.project_slug,
      title: createdAnalysis.title,
      description: createdAnalysis.description,
      city: createdAnalysis.city,
      quadrant: createdAnalysis.quadrant,
      category: createdAnalysis.category as AnalysisCategory,
      thumbnail_url: createdAnalysis.thumbnail_url,
      video_url: createdAnalysis.video_url || undefined,
      technical_summary: createdAnalysis.technical_summary,
      created_at: createdAnalysis.created_at,
      updated_at: createdAnalysis.updated_at,
      deleted_at: createdAnalysis.deleted_at,
      relative_time: 'Hace unos momentos',
      assets: (createdAssets as AnalysisAsset[]) || [],
    };
  },

  /**
   * Eliminación lógica (Soft Delete) de un análisis y sus assets asociados.
   */
  async softDeleteAnalysis(id: string): Promise<boolean> {
    const timestamp = new Date().toISOString();

    const { error: analysisError } = await supabase
      .from('analyses')
      .update({ deleted_at: timestamp })
      .eq('id', id);

    if (analysisError) {
      console.error('Error soft-deleting analysis:', analysisError);
      throw analysisError;
    }

    // También marcar assets asociados como eliminados lógicamente
    await supabase
      .from('analysis_assets')
      .update({ deleted_at: timestamp })
      .eq('analysis_id', id);

    return true;
  },
};
