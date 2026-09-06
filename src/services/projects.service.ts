import { supabase } from '../lib/supabase';
import type { Category } from '../types/category';
import type {
  CreateProjectDTO,
  Project,
  ProjectQueryParams,
} from '../types/project';

/**
 * Genera un slug seguro y limpio a partir de un texto en español.
 */
export function generateProjectSlug(text: string): string {
  const base = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza caracteres no alfanuméricos por guión
    .replace(/^-+|-+$/g, ''); // Quita guiones iniciales o finales

  return base || 'nuevo-proyecto';
}

/**
 * Formatea una fecha ISO a texto relativo amigable.
 */
function formatRelativeDate(isoDate?: string): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Servicio conectado a Supabase para la gestión de proyectos / terrenos (Nivel 1).
 */
export const projectsService = {
  /**
   * Obtiene la lista de proyectos desde Supabase con filtros opcionales de búsqueda y categoría.
   * Filtra registros activos (deleted_at IS NULL).
   */
  async getProjects(params: ProjectQueryParams = {}): Promise<Project[]> {
    const { search = '', category_slug = 'todos' } = params;

    let query = supabase
      .from('projects')
      .select('*, category:categories(*), analyses:analyses(count)')
      .is('deleted_at', null);

    // Filtro por categoría en servidor
    if (category_slug && category_slug !== 'todos') {
      query = query.eq('category_slug', category_slug);
    }

    // Filtro por búsqueda textual (nombre, ubicación, descripción) en servidor
    if (search.trim()) {
      const term = search.trim();
      query = query.or(
        `name.ilike.%${term}%,location.ilike.%${term}%,description.ilike.%${term}%`
      );
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects from Supabase:', error);
      throw error;
    }

    return (data || []).map((row) => {
      const analysesCount =
        Array.isArray(row.analyses) && row.analyses[0]
          ? (row.analyses[0] as { count: number }).count
          : 0;

      const categoryObj = row.category as Category | undefined;

      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        location: row.location,
        category_slug: row.category_slug,
        category: categoryObj,
        description: row.description || undefined,
        thumbnail_url: row.thumbnail_url || undefined,
        analyses_count: analysesCount,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deleted_at: row.deleted_at,
        relative_time: formatRelativeDate(row.created_at),
      };
    });
  },

  /**
   * Obtiene un proyecto específico por su slug URL desde Supabase.
   */
  async getProjectBySlug(slug: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*, category:categories(*), analyses:analyses(count)')
      .eq('slug', slug.toLowerCase())
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      console.error('Error fetching project by slug:', error);
      throw error;
    }

    if (!data) return null;

    const analysesCount =
      Array.isArray(data.analyses) && data.analyses[0]
        ? (data.analyses[0] as { count: number }).count
        : 0;

    const categoryObj = data.category as Category | undefined;

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      location: data.location,
      category_slug: data.category_slug,
      category: categoryObj,
      description: data.description || undefined,
      thumbnail_url: data.thumbnail_url || undefined,
      analyses_count: analysesCount,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      relative_time: formatRelativeDate(data.created_at),
    };
  },

  /**
   * Crea un nuevo proyecto en Supabase con su slug único y miniaturas temáticas.
   */
  async createProject(dto: CreateProjectDTO): Promise<Project> {
    const baseSlug = generateProjectSlug(dto.name);
    let slug = baseSlug;

    // Verificar si el slug ya existe en base de datos
    const { data: existing } = await supabase
      .from('projects')
      .select('slug')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Miniatura satelital predeterminada según categoría
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

    const newRow = {
      slug,
      name: dto.name.trim(),
      location: dto.location.trim(),
      category_slug: dto.category_slug,
      description: dto.description?.trim() || null,
      thumbnail_url:
        categoryThumbnails[dto.category_slug] ||
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(newRow)
      .select('*, category:categories(*)')
      .single();

    if (error) {
      console.error('Error creating project in Supabase:', error);
      throw error;
    }

    const categoryObj = data.category as Category | undefined;

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      location: data.location,
      category_slug: data.category_slug,
      category: categoryObj,
      description: data.description || undefined,
      thumbnail_url: data.thumbnail_url || undefined,
      analyses_count: 0,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      relative_time: 'Recién creado',
    };
  },

  /**
   * Actualiza los datos de un proyecto existente en Supabase.
   */
  async updateProject(id: string, dto: Partial<CreateProjectDTO>): Promise<Project> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.location !== undefined) updateData.location = dto.location.trim();
    if (dto.category_slug !== undefined) updateData.category_slug = dto.category_slug;
    if (dto.description !== undefined) updateData.description = dto.description.trim() || null;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select('*, category:categories(*), analyses:analyses(count)')
      .single();

    if (error) {
      console.error('Error updating project in Supabase:', error);
      throw error;
    }

    const analysesCount =
      Array.isArray(data.analyses) && data.analyses[0]
        ? (data.analyses[0] as { count: number }).count
        : 0;

    const categoryObj = data.category as Category | undefined;

    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      location: data.location,
      category_slug: data.category_slug,
      category: categoryObj,
      description: data.description || undefined,
      thumbnail_url: data.thumbnail_url || undefined,
      analyses_count: analysesCount,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      relative_time: formatRelativeDate(data.created_at),
    };
  },

  /**
   * Eliminación lógica (Soft Delete) de un proyecto.
   * Regla de negocio: Si el proyecto tiene análisis activos, no se permite su eliminación.
   */
  async softDeleteProject(id: string): Promise<boolean> {
    // 1. Verificar si existen análisis activos asociados al proyecto
    const { count, error: countError } = await supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', id)
      .is('deleted_at', null);

    if (countError) {
      console.error('Error verificando análisis del proyecto:', countError);
      throw countError;
    }

    if (count && count > 0) {
      throw new Error(
        `No se puede eliminar este proyecto porque contiene ${count} análisis activo(s). Debes eliminar primero los análisis dentro del proyecto para poder eliminarlo.`
      );
    }

    // 2. Proceder con el soft delete si no tiene análisis activos
    const { error } = await supabase
      .from('projects')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error soft-deleting project:', error);
      throw error;
    }
    return true;
  },

  /**
   * Compatibilidad hacia atrás (conteo ahora gestionado dinámicamente por la BD).
   */
  incrementAnalysesCount(_projectSlug: string): void {
    // Ya no es necesario mutar en memoria porque Supabase calcula el conteo relacional en tiempo real
  },
};
