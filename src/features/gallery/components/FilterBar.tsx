import React from 'react';
import type { AnalysisCategory, AnalysisStatus } from '../../../types/analysis';

interface FilterBarProps {
  currentCategory: AnalysisCategory | 'todos';
  onSelectCategory: (category: AnalysisCategory | 'todos') => void;
  currentStatus: AnalysisStatus | 'todos';
  onSelectStatus: (status: AnalysisStatus | 'todos') => void;
  onClearFilters: () => void;
  isFiltered: boolean;
}

interface CategoryOption {
  id: AnalysisCategory | 'todos';
  label: string;
  icon: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'todos', label: 'Todos los estudios', icon: 'grid_view' },
  { id: 'movilidad', label: 'Movilidad Urbana', icon: 'insights' },
  { id: 'topografia', label: 'Topografía', icon: 'terrain' },
  { id: 'demografia', label: 'Demografía', icon: 'group' },
  { id: 'medio_ambiente', label: 'Medio Ambiente', icon: 'eco' },
  { id: 'catastro', label: 'Catastro', icon: 'domain' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  currentCategory,
  onSelectCategory,
  currentStatus,
  onSelectStatus,
  onClearFilters,
  isFiltered,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
      {/* Category Chips List */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-['Inter'] transition-all duration-150 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#7bd0ff]/20 text-[#7bd0ff] border border-[#7bd0ff]/50 font-semibold shadow-sm shadow-[#7bd0ff]/10'
                  : 'bg-[#122131]/80 hover:bg-[#1c2b3c] text-[#c6c6cd] border border-white/5 hover:text-[#d4e4fa]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {cat.icon}
              </span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Filter & Reset */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <div className="relative">
          <select
            aria-label="Filtrar por estado del análisis"
            value={currentStatus}
            onChange={(e) =>
              onSelectStatus(e.target.value as AnalysisStatus | 'todos')
            }
            className="bg-[#122131]/90 hover:bg-[#1c2b3c] border border-white/10 text-[#d4e4fa] text-xs font-['Inter'] rounded-lg px-3 py-1.5 outline-none focus:border-[#7bd0ff] transition-colors cursor-pointer appearance-none pr-7"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Solo Activos</option>
            <option value="completado">Solo Completados</option>
            <option value="en_proceso">En Proceso</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[#909097] text-[16px] pointer-events-none">
            expand_more
          </span>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-[#ffb690] hover:text-[#ffdbca] transition-colors px-2 py-1.5 cursor-pointer font-['Inter']"
            title="Restablecer filtros"
          >
            <span className="material-symbols-outlined text-[14px]">
              filter_alt_off
            </span>
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>
    </div>
  );
};
