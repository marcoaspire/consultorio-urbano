import { api } from './api';
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
 * Servicio desacoplado para la gestión de proyectos / terrenos (Nivel 1).
 * Conectado a la API REST centralizada.
 */
export const projectsService = {
  /**
   * Obtiene la lista de proyectos con filtros opcionales de búsqueda y categoría.
   */
  async getProjects(params: ProjectQueryParams = {}): Promise<Project[]> {
    const { search = '', category_slug = 'todos' } = params;
    return api.get<Project[]>('/projects', {
      params: {
        search: search.trim() || undefined,
        category_slug: category_slug !== 'todos' ? category_slug : undefined,
      },
    });
  },

  /**
   * Obtiene un proyecto específico por su slug URL o UUID.
   */
  async getProjectBySlug(slug: string): Promise<Project | null> {
    try {
      return await api.get<Project>(`/projects/${encodeURIComponent(slug.toLowerCase())}`);
    } catch (error) {
      console.error('Error fetching project by slug:', error);
      return null;
    }
  },

  /**
   * Crea un nuevo proyecto en el backend REST.
   */
  async createProject(dto: CreateProjectDTO): Promise<Project> {
    return api.post<Project>('/projects', dto);
  },

  /**
   * Actualiza los datos de un proyecto existente.
   */
  async updateProject(id: string, dto: Partial<CreateProjectDTO>): Promise<Project> {
    return api.put<Project>(`/projects/${id}`, dto);
  },

  /**
   * Eliminación lógica (Soft Delete) de un proyecto.
   */
  async softDeleteProject(id: string): Promise<boolean> {
    await api.delete(`/projects/${id}`);
    return true;
  },

  /**
   * Compatibilidad hacia atrás (el conteo es gestionado dinámicamente por la BD).
   */
  incrementAnalysesCount(_projectSlug: string): void {
    // Ya no es necesario mutar en memoria porque el backend calcula el conteo relacional en tiempo real
  },
};
