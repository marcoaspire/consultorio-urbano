import { db } from '../config/db.js';
import { getPublicMediaUrl } from '../config/s3.js';
import type {
  Analysis,
  AnalysisAsset,
  Category,
  PaginatedResponse,
  AssetType,
} from '../types/index.js';

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

export const analysesService = {
  async getAnalyses(params: {
    page?: number;
    limit?: number;
    search?: string;
    category_slug?: string;
    projectSlug?: string;
  }): Promise<PaginatedResponse<Analysis>> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 8);
    const offset = (page - 1) * limit;
    const search = params.search || '';
    const category_slug = params.category_slug || 'todos';
    const projectSlug = params.projectSlug || '';

    let whereClause = 'WHERE a.deleted_at IS NULL';
    const values: unknown[] = [];

    if (projectSlug) {
      values.push(projectSlug.toLowerCase());
      whereClause += ` AND p.slug = $${values.length}`;
    }

    if (category_slug && category_slug !== 'todos') {
      values.push(category_slug);
      whereClause += ` AND a.category_slug = $${values.length}`;
    }

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      const idx = values.length;
      whereClause += ` AND (a.title ILIKE $${idx} OR a.description ILIKE $${idx} OR a.city ILIKE $${idx})`;
    }

    // 1. Conteo total
    const countQuery = `
      SELECT COUNT(a.id)::int AS total
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      ${whereClause}
    `;
    const countResult = await db.query(countQuery, values);
    const total = countResult.rows[0]?.total || 0;

    // 2. Registros paginados
    const dataQuery = `
      SELECT 
        a.id, a.slug, a.project_id, a.title, a.description, a.city, a.category_slug,
        a.thumbnail_url, a.video_url, a.technical_summary,
        a.created_at, a.updated_at, a.deleted_at,
        c.name AS category_name, c.scope AS category_scope, c.color AS category_color, c.icon AS category_icon
      FROM analyses a
      JOIN projects p ON a.project_id = p.id
      LEFT JOIN categories c ON a.category_slug = c.slug
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const dataResult = await db.query(dataQuery, [...values, limit, offset]);

    // 3. Cargar assets asociados
    const analysisIds = dataResult.rows.map((r) => r.id);
    let assetsMap: Record<string, AnalysisAsset[]> = {};

    if (analysisIds.length > 0) {
      const assetsResult = await db.query(
        `SELECT id, analysis_id, asset_type, storage_path, public_url, mime_type, file_size_bytes, metadata, created_at, updated_at, deleted_at
         FROM analysis_assets
         WHERE analysis_id = ANY($1) AND deleted_at IS NULL
         ORDER BY created_at ASC`,
        [analysisIds]
      );

      assetsMap = assetsResult.rows.reduce((acc, row) => {
        if (!acc[row.analysis_id]) acc[row.analysis_id] = [];
        const publicUrl = row.public_url || getPublicMediaUrl(row.storage_path);
        acc[row.analysis_id].push({
          id: row.id,
          analysis_id: row.analysis_id,
          asset_type: row.asset_type,
          storage_path: row.storage_path,
          public_url: publicUrl,
          mime_type: row.mime_type,
          file_size_bytes: row.file_size_bytes ? Number(row.file_size_bytes) : undefined,
          metadata: row.metadata || undefined,
          created_at: row.created_at.toISOString(),
          updated_at: row.updated_at ? row.updated_at.toISOString() : undefined,
          deleted_at: row.deleted_at ? row.deleted_at.toISOString() : null,
        });
        return acc;
      }, {} as Record<string, AnalysisAsset[]>);
    }

    const items: Analysis[] = dataResult.rows.map((row) => {
      const analysisAssets = assetsMap[row.id] || [];
      const afterAsset = analysisAssets.find((a) => a.asset_type === 'image_after');
      const thumb =
        row.thumbnail_url ||
        afterAsset?.public_url ||
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80';

      const cat: Category | undefined = row.category_name
        ? {
            slug: row.category_slug,
            name: row.category_name,
            scope: row.category_scope,
            color: row.category_color,
            icon: row.category_icon,
          }
        : undefined;

      return {
        id: row.id,
        slug: row.slug,
        project_id: row.project_id,
        title: row.title,
        description: row.description,
        city: row.city,
        category_slug: row.category_slug,
        category: cat,
        thumbnail_url: getPublicMediaUrl(thumb),
        video_url: row.video_url ? getPublicMediaUrl(row.video_url) : undefined,
        technical_summary: row.technical_summary || undefined,
        created_at: row.created_at.toISOString(),
        updated_at: row.updated_at.toISOString(),
        deleted_at: row.deleted_at ? row.deleted_at.toISOString() : null,
        relative_time: formatRelativeDate(row.created_at.toISOString()),
        assets: analysisAssets,
      };
    });

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      data: items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  },

  async getAnalysisBySlug(slugOrId: string): Promise<Analysis | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      slugOrId
    );

    const query = `
      SELECT 
        a.id, a.slug, a.project_id, a.title, a.description, a.city, a.category_slug,
        a.thumbnail_url, a.video_url, a.technical_summary,
        a.created_at, a.updated_at, a.deleted_at,
        c.name AS category_name, c.scope AS category_scope, c.color AS category_color, c.icon AS category_icon
      FROM analyses a
      LEFT JOIN categories c ON a.category_slug = c.slug
      WHERE ${isUuid ? 'a.id = $1' : 'a.slug = $1'} AND a.deleted_at IS NULL
    `;

    const result = await db.query(query, [isUuid ? slugOrId : slugOrId.toLowerCase()]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    // Cargar assets
    const assetsResult = await db.query(
      `SELECT id, analysis_id, asset_type, storage_path, public_url, mime_type, file_size_bytes, metadata, created_at, updated_at, deleted_at
       FROM analysis_assets
       WHERE analysis_id = $1 AND deleted_at IS NULL
       ORDER BY created_at ASC`,
      [row.id]
    );

    const assets: AnalysisAsset[] = assetsResult.rows.map((a) => ({
      id: a.id,
      analysis_id: a.analysis_id,
      asset_type: a.asset_type,
      storage_path: a.storage_path,
      public_url: a.public_url || getPublicMediaUrl(a.storage_path),
      mime_type: a.mime_type,
      file_size_bytes: a.file_size_bytes ? Number(a.file_size_bytes) : undefined,
      metadata: a.metadata || undefined,
      created_at: a.created_at.toISOString(),
      updated_at: a.updated_at ? a.updated_at.toISOString() : undefined,
      deleted_at: a.deleted_at ? a.deleted_at.toISOString() : null,
    }));

    const cat: Category | undefined = row.category_name
      ? {
          slug: row.category_slug,
          name: row.category_name,
          scope: row.category_scope,
          color: row.category_color,
          icon: row.category_icon,
        }
      : undefined;

    return {
      id: row.id,
      slug: row.slug,
      project_id: row.project_id,
      title: row.title,
      description: row.description,
      city: row.city,
      category_slug: row.category_slug,
      category: cat,
      thumbnail_url: row.thumbnail_url ? getPublicMediaUrl(row.thumbnail_url) : undefined,
      video_url: row.video_url ? getPublicMediaUrl(row.video_url) : undefined,
      technical_summary: row.technical_summary || undefined,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at.toISOString(),
      deleted_at: row.deleted_at ? row.deleted_at.toISOString() : null,
      relative_time: formatRelativeDate(row.created_at.toISOString()),
      assets,
    };
  },

  async createAnalysis(data: {
    title: string;
    description: string;
    city: string;
    category_slug: string;
    projectId?: string;
    projectSlug?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    technical_summary?: Record<string, unknown>;
    assets?: Array<{
      asset_type: AssetType;
      storage_path: string;
      public_url?: string;
      mime_type: string;
      file_size_bytes?: number;
      metadata?: Record<string, unknown>;
    }>;
  }): Promise<Analysis> {
    // 1. Resolver project_id
    let projectId = data.projectId;

    if (!projectId && data.projectSlug) {
      const proj = await db.query(
        'SELECT id FROM projects WHERE slug = $1 AND deleted_at IS NULL',
        [data.projectSlug.toLowerCase()]
      );
      if (proj.rows.length > 0) {
        projectId = proj.rows[0].id;
      }
    }

    if (!projectId) {
      // Tomar el primer proyecto activo o crear uno por defecto
      const firstProj = await db.query(
        'SELECT id FROM projects WHERE deleted_at IS NULL ORDER BY created_at ASC LIMIT 1'
      );
      if (firstProj.rows.length > 0) {
        projectId = firstProj.rows[0].id;
      } else {
        const createdProj = await db.query(
          `INSERT INTO projects (slug, name, location, category_slug, description)
           VALUES ('proyecto-general', 'Proyecto General', 'Principal', 'topografia', 'Contenedor inicial de análisis')
           RETURNING id`
        );
        projectId = createdProj.rows[0].id;
      }
    }

    // 2. Generar slug
    const baseSlug = data.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    // 3. Insertar análisis
    const insertResult = await db.query(
      `INSERT INTO analyses (
        slug, project_id, title, description, city, category_slug,
        thumbnail_url, video_url, technical_summary
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        slug,
        projectId,
        data.title.trim(),
        data.description.trim(),
        data.city.trim(),
        data.category_slug,
        data.thumbnailUrl || null,
        data.videoUrl?.trim() || null,
        data.technical_summary ? JSON.stringify(data.technical_summary) : null,
      ]
    );

    const createdRow = insertResult.rows[0];

    // 4. Insertar assets si fueron suministrados
    if (data.assets && data.assets.length > 0) {
      for (const asset of data.assets) {
        const publicUrl = asset.public_url || getPublicMediaUrl(asset.storage_path);
        await db.query(
          `INSERT INTO analysis_assets (
            analysis_id, asset_type, storage_path, public_url, mime_type, file_size_bytes, metadata
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            createdRow.id,
            asset.asset_type,
            asset.storage_path,
            publicUrl,
            asset.mime_type,
            asset.file_size_bytes || null,
            asset.metadata ? JSON.stringify(asset.metadata) : null,
          ]
        );
      }
    }

    const fullAnalysis = await this.getAnalysisBySlug(createdRow.id);
    if (!fullAnalysis) throw new Error('Error al recargar análisis recién creado.');
    return fullAnalysis;
  },

  async updateAnalysis(
    id: string,
    data: {
      title?: string;
      description?: string;
      city?: string;
      category_slug?: string;
      videoUrl?: string;
    }
  ): Promise<Analysis> {
    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [id];

    if (data.title !== undefined) {
      values.push(data.title.trim());
      updates.push(`title = $${values.length}`);
    }
    if (data.description !== undefined) {
      values.push(data.description.trim());
      updates.push(`description = $${values.length}`);
    }
    if (data.city !== undefined) {
      values.push(data.city.trim());
      updates.push(`city = $${values.length}`);
    }
    if (data.category_slug !== undefined) {
      values.push(data.category_slug);
      updates.push(`category_slug = $${values.length}`);
    }
    if (data.videoUrl !== undefined) {
      values.push(data.videoUrl.trim() || null);
      updates.push(`video_url = $${values.length}`);
    }

    const query = `
      UPDATE analyses
      SET ${updates.join(', ')}
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id
    `;

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Análisis no encontrado para actualizar.');
    }

    const updated = await this.getAnalysisBySlug(id);
    if (!updated) throw new Error('Error al recargar análisis actualizado.');
    return updated;
  },

  async softDeleteAnalysis(id: string): Promise<boolean> {
    const result = await db.query(
      'UPDATE analyses SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Análisis no encontrado.');
    }

    // Marcar assets asociados como eliminados
    await db.query('UPDATE analysis_assets SET deleted_at = NOW() WHERE analysis_id = $1', [id]);

    return true;
  },
};
