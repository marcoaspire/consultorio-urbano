import { supabase } from '../lib/supabase';
import type { Category, CategoryScope } from '../types/category';

export const categoriesService = {
  /**
   * Obtiene la lista de categorías filtrada por el ámbito (scope).
   * Si no se especifica scope, retorna todas las categorías.
   * Si se especifica scope ('project' o 'analysis'), retorna categorías asociadas a ese scope O de ámbito 'both'.
   */
  async getCategories(scope?: CategoryScope): Promise<Category[]> {
    let query = supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (scope) {
      query = query.or(`scope.eq.${scope},scope.eq.both`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener las categorías:', error);
      throw new Error(`Error al obtener las categorías: ${error.message}`);
    }

    return (data || []) as Category[];
  },

  /**
   * Obtiene una categoría por su slug.
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error(`Error al obtener la categoría ${slug}:`, error);
      return null;
    }

    return data as Category | null;
  }
};
