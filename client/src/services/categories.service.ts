import { api } from './api';
import type { Category, CategoryScope } from '../types/category';

export const categoriesService = {
  /**
   * Obtiene la lista de categorías filtrada opcionalmente por el ámbito (scope).
   * Si no se especifica scope, retorna todas las categorías.
   */
  async getCategories(scope?: CategoryScope): Promise<Category[]> {
    return api.get<Category[]>('/categories', {
      params: scope ? { scope } : undefined,
    });
  },

  /**
   * Obtiene una categoría específica por su slug.
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      return await api.get<Category>(`/categories/${encodeURIComponent(slug)}`);
    } catch (error) {
      console.error(`Error al obtener la categoría ${slug}:`, error);
      return null;
    }
  },
};
