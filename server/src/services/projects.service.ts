import { db } from '../config/db.js';
import type { Project, Category } from '../types/index.js';

export function generateProjectSlug(text: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return base || 'nuevo-proyecto';
}

function formatRelativeDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const projectsService = {
  async getProjects(params: {
    search?: string;
    category_slug?: string;
  }): Promise<Project[]> {
    const { search = '', category_slug = 'todos' } = params;

    let query = `
      SELECT 
        p.id, p.slug, p.name, p.location, p.category_slug, p.description, p.thumbnail_url,
        p.created_at, p.updated_at, p.deleted_at,
        c.name AS category_name, c.scope AS category_scope, c.color AS category_color, c.icon AS category_icon,
        COUNT(a.id) FILTER (WHERE a.deleted_at IS NULL)::int AS analyses_count
      FROM projects p
      LEFT JOIN categories c ON p.category_slug = c.slug
      LEFT JOIN analyses a ON a.project_id = p.id AND a.deleted_at IS NULL
      WHERE p.deleted_at IS NULL
    `;

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (category_slug && category_slug !== 'todos') {
      values.push(category_slug);
      conditions.push(`p.category_slug = $${values.length}`);
    }

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      const idx = values.length;
      conditions.push(`(p.name ILIKE $${idx} OR p.location ILIKE $${idx} OR p.description ILIKE $${idx})`);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY p.id, c.slug
      ORDER BY p.created_at DESC
    `;

    const result = await db.query(query, values);

    return result.rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      location: row.location,
      category_slug: row.category_slug,
      category: row.category_name
        ? {
            slug: row.category_slug,
            name: row.category_name,
            scope: row.category_scope,
            color: row.category_color,
            icon: row.category_icon,
          }
        : undefined,
      description: row.description || undefined,
      thumbnail_url: row.thumbnail_url || undefined,
      analyses_count: Number(row.analyses_count) || 0,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at ? row.updated_at.toISOString() : undefined,
      deleted_at: row.deleted_at ? row.deleted_at.toISOString() : null,
      relative_time: formatRelativeDate(row.created_at.toISOString()),
    }));
  },

  async getProjectBySlug(slugOrId: string): Promise<Project | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId);

    const query = `
      SELECT 
        p.id, p.slug, p.name, p.location, p.category_slug, p.description, p.thumbnail_url,
        p.created_at, p.updated_at, p.deleted_at,
        c.name AS category_name, c.scope AS category_scope, c.color AS category_color, c.icon AS category_icon,
        COUNT(a.id) FILTER (WHERE a.deleted_at IS NULL)::int AS analyses_count
      FROM projects p
      LEFT JOIN categories c ON p.category_slug = c.slug
      LEFT JOIN analyses a ON a.project_id = p.id AND a.deleted_at IS NULL
      WHERE ${isUuid ? 'p.id = $1' : 'p.slug = $1'} AND p.deleted_at IS NULL
      GROUP BY p.id, c.slug
    `;

    const result = await db.query(query, [isUuid ? slugOrId : slugOrId.toLowerCase()]);
    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      location: row.location,
      category_slug: row.category_slug,
      category: row.category_name
        ? {
            slug: row.category_slug,
            name: row.category_name,
            scope: row.category_scope,
            color: row.category_color,
            icon: row.category_icon,
          }
        : undefined,
      description: row.description || undefined,
      thumbnail_url: row.thumbnail_url || undefined,
      analyses_count: Number(row.analyses_count) || 0,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at ? row.updated_at.toISOString() : undefined,
      deleted_at: row.deleted_at ? row.deleted_at.toISOString() : null,
      relative_time: formatRelativeDate(row.created_at.toISOString()),
    };
  },

  async createProject(data: {
    name: string;
    location: string;
    category_slug: string;
    description?: string;
  }): Promise<Project> {
    const baseSlug = generateProjectSlug(data.name);
    let slug = baseSlug;

    const existing = await db.query('SELECT slug FROM projects WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const categoryThumbnails: Record<string, string> = {
      topografia:
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
      catastro:
        'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
      medio_ambiente:
        'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      movilidad:
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    };

    const thumbnailUrl =
      categoryThumbnails[data.category_slug] ||
      'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80';

    const insertResult = await db.query(
      `INSERT INTO projects (slug, name, location, category_slug, description, thumbnail_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, slug, name, location, category_slug, description, thumbnail_url, created_at, updated_at, deleted_at`,
      [
        slug,
        data.name.trim(),
        data.location.trim(),
        data.category_slug,
        data.description?.trim() || null,
        thumbnailUrl,
      ]
    );

    const row = insertResult.rows[0];

    // Obtener detalles de la categoría
    const catResult = await db.query('SELECT * FROM categories WHERE slug = $1', [row.category_slug]);
    const cat: Category | undefined = catResult.rows[0];

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      location: row.location,
      category_slug: row.category_slug,
      category: cat,
      description: row.description || undefined,
      thumbnail_url: row.thumbnail_url || undefined,
      analyses_count: 0,
      created_at: row.created_at.toISOString(),
      updated_at: row.updated_at ? row.updated_at.toISOString() : undefined,
      deleted_at: row.deleted_at ? row.deleted_at.toISOString() : null,
      relative_time: 'Recién creado',
    };
  },

  async updateProject(
    id: string,
    data: {
      name?: string;
      location?: string;
      category_slug?: string;
      description?: string;
    }
  ): Promise<Project> {
    const updates: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [id];

    if (data.name !== undefined) {
      values.push(data.name.trim());
      updates.push(`name = $${values.length}`);
    }
    if (data.location !== undefined) {
      values.push(data.location.trim());
      updates.push(`location = $${values.length}`);
    }
    if (data.category_slug !== undefined) {
      values.push(data.category_slug);
      updates.push(`category_slug = $${values.length}`);
    }
    if (data.description !== undefined) {
      values.push(data.description.trim() || null);
      updates.push(`description = $${values.length}`);
    }

    const query = `
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, slug
    `;

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Proyecto no encontrado para actualizar.');
    }

    const updated = await this.getProjectBySlug(result.rows[0].id);
    if (!updated) throw new Error('Error al recargar proyecto actualizado.');
    return updated;
  },

  async softDeleteProject(id: string): Promise<boolean> {
    // 1. Validar que no contenga análisis activos asociados
    const countResult = await db.query(
      'SELECT COUNT(*)::int AS count FROM analyses WHERE project_id = $1 AND deleted_at IS NULL',
      [id]
    );

    const activeAnalysesCount = countResult.rows[0]?.count || 0;
    if (activeAnalysesCount > 0) {
      throw new Error(
        `No se puede eliminar este proyecto porque contiene ${activeAnalysesCount} análisis activo(s). Debes eliminar primero los análisis dentro del proyecto para poder eliminarlo.`
      );
    }

    // 2. Ejecutar soft delete
    const result = await db.query(
      'UPDATE projects SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      throw new Error('Proyecto no encontrado.');
    }

    return true;
  },
};
