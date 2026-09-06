import type {
  CreateProjectDTO,
  Project,
  ProjectQueryParams,
} from '../types/project';
import { MOCK_ANALYSES } from './mockAnalyses';
import { MOCK_PROJECTS } from './mockProjects';

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
 * Servicio desacoplado para la gestión de proyectos / terrenos (Nivel 1).
 */
export const projectsService = {
  /**
   * Obtiene la lista de proyectos con filtros opcionales de búsqueda y categoría.
   */
  async getProjects(params: ProjectQueryParams = {}): Promise<Project[]> {
    const { search = '', category = 'todos' } = params;

    // Latencia de red simulada para activar skeletons visuales
    await new Promise((resolve) => setTimeout(resolve, 240));

    // Sincronizar conteo de entregas en tiempo real
    const synced = MOCK_PROJECTS.map((p) => ({
      ...p,
      analyses_count: MOCK_ANALYSES.filter((a) => a.project_slug === p.slug).length,
    }));

    let results = synced;

    // Filtro por categoría
    if (category && category !== 'todos') {
      results = results.filter((p) => p.category === category);
    }

    // Filtro por búsqueda textual (nombre, ubicación, descripción)
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query))
      );
    }

    return results;
  },

  /**
   * Obtiene un proyecto específico por su slug URL.
   */
  async getProjectBySlug(slug: string): Promise<Project | null> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    const found = MOCK_PROJECTS.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase()
    );
    if (!found) return null;

    return {
      ...found,
      analyses_count: MOCK_ANALYSES.filter((a) => a.project_slug === found.slug).length,
    };
  },

  /**
   * Crea un nuevo proyecto en memoria y genera su slug único.
   */
  async createProject(dto: CreateProjectDTO): Promise<Project> {
    await new Promise((resolve) => setTimeout(resolve, 200));

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `p-${Date.now().toString(16)}`;

    const baseSlug = generateProjectSlug(dto.name);
    // Asegurar unicidad de slug
    let slug = baseSlug;
    let counter = 1;
    while (MOCK_PROJECTS.some((p) => p.slug === slug)) {
      counter += 1;
      slug = `${baseSlug}-${counter}`;
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

    const newProject: Project = {
      id,
      slug,
      name: dto.name.trim(),
      location: dto.location.trim(),
      category: dto.category,
      description: dto.description?.trim() || undefined,
      thumbnail_url:
        categoryThumbnails[dto.category] ||
        'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80',
      analyses_count: 0,
      created_at: new Date().toISOString(),
      relative_time: 'Recién creado',
    };

    MOCK_PROJECTS.unshift(newProject);
    return newProject;
  },

  /**
   * Incrementa el conteo de análisis asociados a un proyecto
   */
  incrementAnalysesCount(projectSlug: string): void {
    const proj = MOCK_PROJECTS.find((p) => p.slug === projectSlug);
    if (proj) {
      proj.analyses_count = (proj.analyses_count || 0) + 1;
    }
  },
};
