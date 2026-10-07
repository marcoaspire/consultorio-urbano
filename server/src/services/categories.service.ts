import { db } from '../config/db.js';
import type { Category, CategoryScope } from '../types/index.js';

export const categoriesService = {
  async getCategories(scope?: CategoryScope): Promise<Category[]> {
    let query = 'SELECT slug, name, scope, color, icon, created_at FROM categories';
    const params: unknown[] = [];

    if (scope) {
      query += ' WHERE scope = $1 OR scope = $2 ORDER BY name ASC';
      params.push(scope, 'both');
    } else {
      query += ' ORDER BY name ASC';
    }

    const result = await db.query(query, params);
    return result.rows;
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const result = await db.query(
      'SELECT slug, name, scope, color, icon, created_at FROM categories WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) return null;
    return result.rows[0];
  },

  async createCategory(data: {
    slug: string;
    name: string;
    scope: CategoryScope;
    color?: string;
    icon?: string;
  }): Promise<Category> {
    const result = await db.query(
      `INSERT INTO categories (slug, name, scope, color, icon)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name, scope = EXCLUDED.scope, color = EXCLUDED.color, icon = EXCLUDED.icon
       RETURNING slug, name, scope, color, icon, created_at`,
      [data.slug, data.name, data.scope, data.color || null, data.icon || null]
    );

    return result.rows[0];
  },
};
