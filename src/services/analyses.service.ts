import type {
  Analysis,
  AnalysisQueryParams,
  PaginatedResponse,
} from '../types/analysis';
import { MOCK_ANALYSES } from './mockAnalyses';
import { projectsService } from './projects.service';

/**
 * Servicio desacoplado para la consulta de análisis.
 * Simula la paginación y filtrado del lado del servidor (PostgreSQL/Supabase)
 * con latencia asíncrona real para validar estados de carga (skeletons).
 */
export const analysesService = {
  /**
   * Obtiene la lista paginada de análisis con filtros opcionales.
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

    // Simulación de latencia de red de base de datos remota (300ms)
    await new Promise((resolve) => setTimeout(resolve, 280));

    let filtered = [...MOCK_ANALYSES];

    // Filtro por proyecto (Nivel 2)
    if (projectSlug) {
      filtered = filtered.filter(
        (item) => item.project_slug?.toLowerCase() === projectSlug.toLowerCase()
      );
    }

    // Filtro por categoría en servidor
    if (category && category !== 'todos') {
      filtered = filtered.filter((item) => item.category === category);
    }

    // Filtro textual por búsqueda (título, descripción, ciudad)
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.city.toLowerCase().includes(query)
      );
    }

    // Cálculo de paginación del lado del servidor
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const validPage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (validPage - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page: validPage,
      limit,
      totalPages,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    };
  },

  /**
   * Obtiene un análisis específico por su UUID.
   */
  async getAnalysisById(id: string): Promise<Analysis | null> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const found = MOCK_ANALYSES.find((item) => item.id === id);
    return found || null;
  },

  /**
   * Obtiene un análisis específico por su slug amigable URL.
   */
  async getAnalysisBySlug(slug: string): Promise<Analysis | null> {
    await new Promise((resolve) => setTimeout(resolve, 220));
    const found = MOCK_ANALYSES.find(
      (item) => item.slug.toLowerCase() === slug.toLowerCase()
    );
    return found || null;
  },

  /**
   * Publica un nuevo análisis en el sistema.
   * Simula la subida de archivos pesados al almacenamiento de objetos (P3)
   * y la inserción en la base de datos PostgreSQL.
   */
  async createAnalysis(
    dto: import('../types/analysis').CreateAnalysisDTO,
    onProgress?: (progress: number) => void
  ): Promise<Analysis> {
    // Simulación de etapas de subida con progreso
    if (onProgress) onProgress(15);
    await new Promise((resolve) => setTimeout(resolve, 180));

    if (onProgress) onProgress(45);
    await new Promise((resolve) => setTimeout(resolve, 220));

    if (onProgress) onProgress(75);
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Generación de identificador único y slug amigable
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `f81d4fae-${Date.now().toString(16)}-mock`;

    const baseSlug = dto.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = `${baseSlug}-${Math.floor(10 + Math.random() * 90)}`;

    // Rutas para imágenes (objeto local o placeholder temático)
    const beforeUrl = dto.imageBeforeFile
      ? URL.createObjectURL(dto.imageBeforeFile)
      : 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80';

    const afterUrl = dto.imageAfterFile
      ? URL.createObjectURL(dto.imageAfterFile)
      : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';

    const pdfFilename = dto.pdfReportFile?.name || 'Reporte_Tecnico_Oficial.pdf';

    const assets: import('../types/analysis').AnalysisAsset[] = [
      {
        id: `${id}-asset-before`,
        analysis_id: id,
        asset_type: 'image_before',
        storage_path: beforeUrl,
        mime_type: dto.imageBeforeFile?.type || 'image/jpeg',
        file_size_bytes: dto.imageBeforeFile?.size,
        metadata: {
          label: 'Histórico (Previa)',
          year: String(new Date().getFullYear() - 2),
        },
        created_at: new Date().toISOString(),
      },
      {
        id: `${id}-asset-after`,
        analysis_id: id,
        asset_type: 'image_after',
        storage_path: afterUrl,
        mime_type: dto.imageAfterFile?.type || 'image/jpeg',
        file_size_bytes: dto.imageAfterFile?.size,
        metadata: {
          label: 'Actual (Reciente)',
          year: String(new Date().getFullYear()),
        },
        created_at: new Date().toISOString(),
      },

    ];

    if (dto.pdfReportFile) {
      assets.push({
        id: `${id}-asset-pdf`,
        analysis_id: id,
        asset_type: 'pdf_report',
        storage_path: `analyses/${slug}/${pdfFilename}`,
        mime_type: dto.pdfReportFile.type || 'application/pdf',
        file_size_bytes: dto.pdfReportFile.size,
        metadata: { pages: 8 },
        created_at: new Date().toISOString(),
      });
    }

    const newAnalysis: Analysis = {
      id,
      slug,
      project_slug: dto.projectSlug,
      title: dto.title.trim(),
      description: dto.description.trim(),
      city: dto.city.trim(),
      quadrant: dto.quadrant?.trim() || 'Sector Central',
      category: dto.category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      relative_time: 'Hace unos momentos',
      thumbnail_url: afterUrl,
      assets,
      technical_summary: {
        pdf_filename: pdfFilename,
        pdf_total_pages: 8,
        tags: ['Recién Publicado', 'Alta Prioridad'],
        metrics: [
          { label: 'Resolución', value: 'Sub-métrica' },
          { label: 'Estado de carga', value: 'Verificado' },
          { label: 'Procesamiento', value: 'Completado' },
        ],
        executive_summary: dto.description.trim(),
      },
    };

    if (onProgress) onProgress(100);
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Agregar al inicio de los datos mock en memoria
    MOCK_ANALYSES.unshift(newAnalysis);

    if (dto.projectSlug) {
      projectsService.incrementAnalysesCount(dto.projectSlug);
    }

    return newAnalysis;
  },
};


