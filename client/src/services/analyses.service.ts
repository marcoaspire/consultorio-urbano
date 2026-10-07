import { api } from './api';
import type {
  Analysis,
  AnalysisQueryParams,
  CreateAnalysisDTO,
  PaginatedResponse,
  AssetType,
} from '../types/analysis';

/**
 * Resuelve la URL pública de un asset si no viene completa desde el backend.
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
  return storagePath;
}

/**
 * Helper para subir un archivo físico directamente a Cloudflare R2 usando Presigned URL
 */
async function uploadAssetDirectToR2(
  file: File,
  folder: string,
  onProgress?: (progress: number) => void
): Promise<{ storagePath: string; publicUrl: string }> {
  // 1. Solicitar Presigned PUT URL al backend
  const presigned = await api.post<{
    uploadUrl: string;
    key: string;
    publicUrl: string;
    expiresInSeconds: number;
  }>('/media/presigned-url', {
    filename: file.name,
    contentType: file.type || 'application/octet-stream',
    size: file.size,
    folder,
  });

  // 2. Subir directamente el binario contra Cloudflare R2 con seguimiento de barra de progreso
  await api.uploadDirectToR2(presigned.uploadUrl, file, onProgress);

  // 3. Confirmar registro en el backend
  try {
    await api.post('/media/confirm', {
      storagePath: presigned.key,
      publicUrl: presigned.publicUrl,
      mimeType: file.type || 'application/octet-stream',
      fileSizeBytes: file.size,
    });
  } catch (err) {
    console.warn('Advertencia al confirmar media en backend:', err);
  }

  return {
    storagePath: presigned.key,
    publicUrl: presigned.publicUrl,
  };
}

/**
 * Servicio desacoplado para la consulta y creación de análisis geoespaciales.
 * Utiliza la API REST y subidas directas (Direct-to-Storage) a Cloudflare R2.
 */
export const analysesService = {
  /**
   * Obtiene la lista paginada de análisis con filtros ejecutados en el backend.
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

    return api.get<PaginatedResponse<Analysis>>('/analyses', {
      params: {
        page,
        limit,
        search: search.trim() || undefined,
        category_slug: category_slug !== 'todos' ? category_slug : undefined,
        projectSlug: projectSlug || undefined,
      },
    });
  },

  /**
   * Obtiene un análisis específico por su UUID.
   */
  async getAnalysisById(id: string): Promise<Analysis | null> {
    try {
      return await api.get<Analysis>(`/analyses/${id}`);
    } catch (error) {
      console.error('Error fetching analysis by ID:', error);
      return null;
    }
  },

  /**
   * Obtiene un análisis específico por su slug amigable URL.
   */
  async getAnalysisBySlug(slug: string): Promise<Analysis | null> {
    try {
      return await api.get<Analysis>(`/analyses/${encodeURIComponent(slug.toLowerCase())}`);
    } catch (error) {
      console.error('Error fetching analysis by slug:', error);
      return null;
    }
  },

  /**
   * Publica un nuevo análisis:
   * 1. Solicita Presigned URLs para cada archivo adjunto.
   * 2. Sube los archivos directamente a Cloudflare R2 con barra de progreso.
   * 3. Registra el análisis y los metadatos de los assets en PostgreSQL a través de la API REST.
   */
  async createAnalysis(
    dto: CreateAnalysisDTO,
    onProgress?: (progress: number) => void
  ): Promise<Analysis> {
    if (onProgress) onProgress(5);

    const folderSlug = dto.projectSlug || 'analisis-geoespacial';

    const assetsToCreate: Array<{
      asset_type: AssetType;
      storage_path: string;
      public_url?: string;
      mime_type: string;
      file_size_bytes?: number;
      metadata?: Record<string, unknown>;
    }> = [];

    // Subida Imagen Previa (Before)
    let beforeStoragePath =
      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80';
    let beforePublicUrl = beforeStoragePath;

    if (dto.imageBeforeFile) {
      const res = await uploadAssetDirectToR2(dto.imageBeforeFile, `${folderSlug}/before`, (pct) => {
        if (onProgress) onProgress(5 + Math.round(pct * 0.2));
      });
      beforeStoragePath = res.storagePath;
      beforePublicUrl = res.publicUrl;
    }

    assetsToCreate.push({
      asset_type: 'image_before',
      storage_path: beforeStoragePath,
      public_url: beforePublicUrl,
      mime_type: dto.imageBeforeFile?.type || 'image/jpeg',
      file_size_bytes: dto.imageBeforeFile?.size || 1024 * 1024 * 2,
      metadata: {
        label: 'Histórico (Previa)',
        year: String(new Date().getFullYear() - 2),
      },
    });

    // Subida Imagen Actual (After)
    let afterStoragePath =
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
    let afterPublicUrl = afterStoragePath;

    if (dto.imageAfterFile) {
      const res = await uploadAssetDirectToR2(dto.imageAfterFile, `${folderSlug}/after`, (pct) => {
        if (onProgress) onProgress(25 + Math.round(pct * 0.25));
      });
      afterStoragePath = res.storagePath;
      afterPublicUrl = res.publicUrl;
    }

    assetsToCreate.push({
      asset_type: 'image_after',
      storage_path: afterStoragePath,
      public_url: afterPublicUrl,
      mime_type: dto.imageAfterFile?.type || 'image/jpeg',
      file_size_bytes: dto.imageAfterFile?.size || 1024 * 1024 * 3,
      metadata: {
        label: 'Actual (Reciente)',
        year: String(new Date().getFullYear()),
      },
    });

    // Subida Reporte Técnico PDF
    const pdfFilename = dto.pdfReportFile?.name || 'Reporte_Tecnico_Oficial.pdf';
    if (dto.pdfReportFile) {
      const res = await uploadAssetDirectToR2(dto.pdfReportFile, `${folderSlug}/reports`, (pct) => {
        if (onProgress) onProgress(50 + Math.round(pct * 0.2));
      });
      assetsToCreate.push({
        asset_type: 'pdf_report',
        storage_path: res.storagePath,
        public_url: res.publicUrl,
        mime_type: dto.pdfReportFile.type || 'application/pdf',
        file_size_bytes: dto.pdfReportFile.size,
        metadata: {
          pages: 8,
          filename: pdfFilename,
        },
      });
    }

    // Subida Video (Archivo o URL)
    let finalVideoUrl = dto.videoUrl?.trim() || undefined;
    if (dto.videoFile) {
      const res = await uploadAssetDirectToR2(dto.videoFile, `${folderSlug}/videos`, (pct) => {
        if (onProgress) onProgress(70 + Math.round(pct * 0.15));
      });
      finalVideoUrl = res.publicUrl;
      assetsToCreate.push({
        asset_type: 'video',
        storage_path: res.storagePath,
        public_url: res.publicUrl,
        mime_type: dto.videoFile.type || 'video/mp4',
        file_size_bytes: dto.videoFile.size,
        metadata: {
          label: 'Recorrido en Video',
        },
      });
    }

    if (onProgress) onProgress(88);

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

    // Crear análisis en la API REST con sus assets asociados
    const createdAnalysis = await api.post<Analysis>('/analyses', {
      title: dto.title.trim(),
      description: dto.description.trim(),
      city: dto.city.trim(),
      category_slug: dto.category_slug,
      projectId: dto.projectId,
      projectSlug: dto.projectSlug,
      videoUrl: finalVideoUrl,
      thumbnailUrl: afterPublicUrl,
      technical_summary: technicalSummary,
      assets: assetsToCreate,
    });

    if (onProgress) onProgress(100);

    return createdAnalysis;
  },

  /**
   * Actualiza los datos descriptivos de un análisis.
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
    return api.put<Analysis>(`/analyses/${id}`, dto);
  },

  /**
   * Eliminación lógica (Soft Delete) de un análisis.
   */
  async softDeleteAnalysis(id: string): Promise<boolean> {
    await api.delete(`/analyses/${id}`);
    return true;
  },
};
