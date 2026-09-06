import { supabase } from '../lib/supabase';
import type { Category } from '../types/category';
import type {
  Analysis,
  AnalysisAsset,
  AnalysisQueryParams,
  CreateAnalysisDTO,
  PaginatedResponse,
} from '../types/analysis';

/**
 * Resuelve la URL pública de un asset. Si el valor es una URL externa (http/https/blob), la retorna.
 * Si es una ruta relativa de storage (ej: projects/slug/file.png), utiliza Supabase Storage.
 */
export function getAssetPublicUrl(storagePath: string): string {
  if (!storagePath) return '';
  if (
    storagePath.startsWith('http://') ||
    storagePath.startsWith('https://') ||
    storagePath.startsWith('blob:')
  ) {
    return storagePath;
  }
  const { data } = supabase.storage
    .from('analysis-assets')
    .getPublicUrl(storagePath);
  return data.publicUrl;
}

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
 * Sube un archivo físico a Supabase Storage en el bucket 'analysis-assets'
 * y retorna la ruta relativa de almacenamiento y su URL pública permanente.
 */
async function uploadAssetToStorage(
  file: File,
  projectFolder: string,
  categoryPrefix: string
): Promise<{ storagePath: string; publicUrl: string }> {
  const timestamp = Date.now();
  const sanitizedName = file.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]/g, '_');

  const filePath = `projects/${projectFolder}/${timestamp}_${categoryPrefix}_${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from('analysis-assets')
    .upload(filePath, file, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    console.error(`Error uploading ${categoryPrefix} to storage (${filePath}):`, uploadError);
    throw new Error(`Error al subir "${file.name}" a almacenamiento: ${uploadError.message}`);
  }

  const publicUrl = getAssetPublicUrl(filePath);

  return {
    storagePath: filePath,
    publicUrl,
  };
}

/**
 * Servicio conectado a Supabase para la consulta y creación de análisis geoespaciales.
 * Delega la paginación, conteos y filtrado al backend (PostgreSQL en Supabase)
 * con soporte de Soft Delete en todas las tablas y relaciones normalizadas.
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
      category_slug = 'todos',
      projectSlug,
    } = params;

    const from = (Math.max(1, page) - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('analyses')
      .select(
        '*, category:categories(*), assets:analysis_assets(*), projects!inner(slug)',
        { count: 'exact' }
      )
      .is('deleted_at', null);

    // Filtro por proyecto (Nivel 2) a través del JOIN con projects
    if (projectSlug) {
      query = query.eq('projects.slug', projectSlug.toLowerCase());
    }

    // Filtro por categoría en base de datos
    if (category_slug && category_slug !== 'todos') {
      query = query.eq('category_slug', category_slug);
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
      // Filtrar assets activos (soft delete) y resolver public_url
      const rawAssets = Array.isArray(row.assets) ? row.assets : [];
      const activeAssets: AnalysisAsset[] = rawAssets
        .filter((asset: AnalysisAsset) => !asset.deleted_at)
        .map((asset: AnalysisAsset) => {
          const resolvedPublicUrl = getAssetPublicUrl(asset.storage_path);
          return {
            id: asset.id,
            analysis_id: asset.analysis_id,
            asset_type: asset.asset_type,
            storage_path: asset.storage_path,
            public_url: resolvedPublicUrl,
            mime_type: asset.mime_type,
            file_size_bytes: asset.file_size_bytes,
            metadata: asset.metadata,
            created_at: asset.created_at,
            updated_at: asset.updated_at,
            deleted_at: asset.deleted_at,
          };
        });

      // Extraer miniatura resuelta
      const afterAsset = activeAssets.find((a) => a.asset_type === 'image_after');
      const thumb =
        row.thumbnail_url ||
        afterAsset?.public_url ||
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80';

      const categoryObj = row.category as Category | undefined;

      return {
        id: row.id,
        slug: row.slug,
        project_id: row.project_id,
        title: row.title,
        description: row.description,
        city: row.city,
        category_slug: row.category_slug,
        category: categoryObj,
        thumbnail_url: getAssetPublicUrl(thumb),
        video_url: row.video_url ? getAssetPublicUrl(row.video_url) : undefined,
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
      .select('*, category:categories(*), assets:analysis_assets(*)')
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
        public_url: getAssetPublicUrl(asset.storage_path),
        mime_type: asset.mime_type,
        file_size_bytes: asset.file_size_bytes,
        metadata: asset.metadata,
        created_at: asset.created_at,
        updated_at: asset.updated_at,
        deleted_at: asset.deleted_at,
      }));

    const categoryObj = data.category as Category | undefined;

    return {
      id: data.id,
      slug: data.slug,
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      city: data.city,
      category_slug: data.category_slug,
      category: categoryObj,
      thumbnail_url: data.thumbnail_url ? getAssetPublicUrl(data.thumbnail_url) : undefined,
      video_url: data.video_url ? getAssetPublicUrl(data.video_url) : undefined,
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
      .select('*, category:categories(*), assets:analysis_assets(*)')
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
        public_url: getAssetPublicUrl(asset.storage_path),
        mime_type: asset.mime_type,
        file_size_bytes: asset.file_size_bytes,
        metadata: asset.metadata,
        created_at: asset.created_at,
        updated_at: asset.updated_at,
        deleted_at: asset.deleted_at,
      }));

    const categoryObj = data.category as Category | undefined;

    return {
      id: data.id,
      slug: data.slug,
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      city: data.city,
      category_slug: data.category_slug,
      category: categoryObj,
      thumbnail_url: data.thumbnail_url ? getAssetPublicUrl(data.thumbnail_url) : undefined,
      video_url: data.video_url ? getAssetPublicUrl(data.video_url) : undefined,
      technical_summary: data.technical_summary || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      relative_time: formatRelativeDate(data.created_at),
      assets: activeAssets,
    };
  },

  /**
   * Publica un nuevo análisis en Supabase:
   * Sube los archivos físicos a Supabase Storage (bucket 'analysis-assets'),
   * almacena rutas relativas en PostgreSQL e inserta assets asociados.
   */
  async createAnalysis(
    dto: CreateAnalysisDTO,
    onProgress?: (progress: number) => void
  ): Promise<Analysis> {
    if (onProgress) onProgress(10);

    const baseSlug = dto.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Obtener o resolver project_id
    let projectId = dto.projectId;
    let projectSlug = dto.projectSlug || 'evaluacion-de-terreno-b-42';

    if (!projectId && dto.projectSlug) {
      const { data: proj } = await supabase
        .from('projects')
        .select('id, slug')
        .eq('slug', dto.projectSlug)
        .maybeSingle();

      if (proj) {
        projectId = proj.id;
        projectSlug = proj.slug;
      }
    }

    if (!projectId) {
      // Tomar el primer proyecto activo por defecto si no se proveyó
      const { data: firstProj } = await supabase
        .from('projects')
        .select('id, slug')
        .is('deleted_at', null)
        .limit(1)
        .single();

      if (firstProj) {
        projectId = firstProj.id;
        projectSlug = firstProj.slug;
      } else {
        throw new Error('No existe ningún proyecto activo para vincular el análisis.');
      }
    }

    const folderSlug = projectSlug;

    // 2. Subir archivos a Supabase Storage (guardando ruta relativa)
    let beforeStoragePath =
      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80';
    if (dto.imageBeforeFile) {
      if (onProgress) onProgress(25);
      const uploaded = await uploadAssetToStorage(
        dto.imageBeforeFile,
        folderSlug,
        'before'
      );
      beforeStoragePath = uploaded.storagePath;
    }

    let afterStoragePath =
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
    if (dto.imageAfterFile) {
      if (onProgress) onProgress(45);
      const uploaded = await uploadAssetToStorage(
        dto.imageAfterFile,
        folderSlug,
        'after'
      );
      afterStoragePath = uploaded.storagePath;
    }

    let pdfStoragePath = '';
    const pdfFilename = dto.pdfReportFile?.name || 'Reporte_Tecnico_Oficial.pdf';
    if (dto.pdfReportFile) {
      if (onProgress) onProgress(65);
      const uploaded = await uploadAssetToStorage(
        dto.pdfReportFile,
        folderSlug,
        'pdf'
      );
      pdfStoragePath = uploaded.storagePath;
    }

    let videoStoragePath = dto.videoUrl?.trim() || '';
    if (dto.videoFile) {
      if (onProgress) onProgress(75);
      const uploaded = await uploadAssetToStorage(
        dto.videoFile,
        folderSlug,
        'video'
      );
      videoStoragePath = uploaded.storagePath;
    }

    if (onProgress) onProgress(80);

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

    // 3. Insertar el análisis principal en Supabase
    const { data: createdAnalysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        slug,
        project_id: projectId,
        title: dto.title.trim(),
        description: dto.description.trim(),
        city: dto.city.trim(),
        category_slug: dto.category_slug,
        thumbnail_url: afterStoragePath,
        video_url: videoStoragePath || null,
        technical_summary: technicalSummary,
      })
      .select('*, category:categories(*)')
      .single();

    if (insertError) {
      console.error('Error inserting analysis into Supabase:', insertError);
      throw insertError;
    }

    if (onProgress) onProgress(90);

    // 4. Preparar e insertar assets asociados en Supabase
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
          storage_path: beforeStoragePath,
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
          storage_path: afterStoragePath,
          mime_type: dto.imageAfterFile?.type || 'image/jpeg',
          file_size_bytes: dto.imageAfterFile?.size || 1024 * 1024 * 3,
          metadata: {
            label: 'Actual (Reciente)',
            year: String(new Date().getFullYear()),
          },
        },
      ];

    if (pdfStoragePath) {
      assetsToInsert.push({
        analysis_id: createdAnalysis.id,
        asset_type: 'pdf_report',
        storage_path: pdfStoragePath,
        mime_type: dto.pdfReportFile?.type || 'application/pdf',
        file_size_bytes: dto.pdfReportFile?.size || 1024 * 1024 * 4,
        metadata: {
          pages: 8,
          filename: pdfFilename,
        },
      });
    }

    if (videoStoragePath) {
      assetsToInsert.push({
        analysis_id: createdAnalysis.id,
        asset_type: 'video',
        storage_path: videoStoragePath,
        mime_type: dto.videoFile?.type || 'video/mp4',
        file_size_bytes: dto.videoFile?.size || 1024 * 1024 * 10,
        metadata: {
          label: 'Recorrido en Video',
        },
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

    const categoryObj = createdAnalysis.category as Category | undefined;
    const activeAssets: AnalysisAsset[] = ((createdAssets as AnalysisAsset[]) || []).map(
      (a) => ({
        ...a,
        public_url: getAssetPublicUrl(a.storage_path),
      })
    );

    return {
      id: createdAnalysis.id,
      slug: createdAnalysis.slug,
      project_id: createdAnalysis.project_id,
      title: createdAnalysis.title,
      description: createdAnalysis.description,
      city: createdAnalysis.city,
      category_slug: createdAnalysis.category_slug,
      category: categoryObj,
      thumbnail_url: getAssetPublicUrl(createdAnalysis.thumbnail_url),
      video_url: createdAnalysis.video_url
        ? getAssetPublicUrl(createdAnalysis.video_url)
        : undefined,
      technical_summary: createdAnalysis.technical_summary,
      created_at: createdAnalysis.created_at,
      updated_at: createdAnalysis.updated_at,
      deleted_at: createdAnalysis.deleted_at,
      relative_time: 'Hace unos momentos',
      assets: activeAssets,
    };
  },

  /**
   * Actualiza los datos descriptivos de un análisis existente en Supabase.
   */
  async updateAnalysis(
    id: string,
    dto: {
      title?: string;
      description?: string;
      city?: string;
      category_slug?: string;
      videoUrl?: string;
    }
  ): Promise<Analysis> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.title !== undefined) updateData.title = dto.title.trim();
    if (dto.description !== undefined) updateData.description = dto.description.trim();
    if (dto.city !== undefined) updateData.city = dto.city.trim();
    if (dto.category_slug !== undefined) updateData.category_slug = dto.category_slug;
    if (dto.videoUrl !== undefined) updateData.video_url = dto.videoUrl.trim() || null;

    const { data, error } = await supabase
      .from('analyses')
      .update(updateData)
      .eq('id', id)
      .select('*, category:categories(*), assets:analysis_assets(*)')
      .single();

    if (error) {
      console.error('Error updating analysis in Supabase:', error);
      throw error;
    }

    const rawAssets = Array.isArray(data.assets) ? data.assets : [];
    const activeAssets: AnalysisAsset[] = rawAssets
      .filter((asset: AnalysisAsset) => !asset.deleted_at)
      .map((asset: AnalysisAsset) => ({
        id: asset.id,
        analysis_id: asset.analysis_id,
        asset_type: asset.asset_type,
        storage_path: asset.storage_path,
        public_url: getAssetPublicUrl(asset.storage_path),
        mime_type: asset.mime_type,
        file_size_bytes: asset.file_size_bytes,
        metadata: asset.metadata,
        created_at: asset.created_at,
        updated_at: asset.updated_at,
        deleted_at: asset.deleted_at,
      }));

    const categoryObj = data.category as Category | undefined;

    return {
      id: data.id,
      slug: data.slug,
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      city: data.city,
      category_slug: data.category_slug,
      category: categoryObj,
      thumbnail_url: data.thumbnail_url ? getAssetPublicUrl(data.thumbnail_url) : undefined,
      video_url: data.video_url ? getAssetPublicUrl(data.video_url) : undefined,
      technical_summary: data.technical_summary || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      relative_time: formatRelativeDate(data.created_at),
      assets: activeAssets,
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
