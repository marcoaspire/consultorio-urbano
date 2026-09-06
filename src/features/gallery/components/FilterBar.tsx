import React, { useEffect, useState } from 'react';
import { categoriesService } from '../../../services/categories.service';
import type { Category } from '../../../types/category';

interface FilterBarProps {
  currentCategory: string | 'todos';
  onSelectCategory: (categorySlug: string | 'todos') => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentCategory,
  onSelectCategory,
  onClearFilters,
  isFiltered,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let isMounted = true;
    categoriesService
      .getCategories('analysis')
      .then((cats) => {
        if (isMounted) setCategories(cats);
      })
      .catch((err) => {
        console.error('Error al obtener categorías de análisis para FilterBar:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
      {/* Category Chips List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
        <button
          type="button"
          onClick={() => onSelectCategory('todos')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Inter'] transition-all duration-150 cursor-pointer whitespace-nowrap ${
            currentCategory === 'todos'
              ? 'bg-[#7bd0ff]/20 text-[#7bd0ff] border border-[#7bd0ff]/50 font-semibold shadow-sm shadow-[#7bd0ff]/10'
              : 'bg-[#122131]/80 hover:bg-[#1c2b3c] text-[#c6c6cd] border border-white/5 hover:text-[#d4e4fa]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            grid_view
          </span>
          <span>Todos los estudios</span>
        </button>

        {categories.map((cat) => {
          const isActive = currentCategory === cat.slug;
          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelectCategory(cat.slug)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Inter'] transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#7bd0ff]/20 text-[#7bd0ff] border border-[#7bd0ff]/50 font-semibold shadow-sm shadow-[#7bd0ff]/10'
                  : 'bg-[#122131]/80 hover:bg-[#1c2b3c] text-[#c6c6cd] border border-white/5 hover:text-[#d4e4fa]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {cat.icon || 'folder'}
              </span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Botón para restablecer / limpiar filtros */}
      {isFiltered && (
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-[#ffb690] hover:text-[#ffdbca] transition-colors px-2 py-1.5 cursor-pointer font-['Inter']"
            title="Restablecer filtros"
          >
            <span className="material-symbols-outlined text-[14px]">
              filter_alt_off
            </span>
            <span>Limpiar filtros</span>
          </button>
        </div>
      )}
    </div>
  );
};
