import React from 'react';
import type { Analysis } from '../../../types/analysis';
import { AnalysisCard } from './AnalysisCard';
import { AnalysisCardSkeleton } from './AnalysisCardSkeleton';

interface AnalysisGridProps {
  analyses: Analysis[];
  isLoading: boolean;
  limit: number;
  onSelectAnalysis?: (analysis: Analysis) => void;
  onEditAnalysis?: (analysis: Analysis) => void;
  onDeleteAnalysis?: (analysis: Analysis) => void;
  onResetFilters?: () => void;
}

export const AnalysisGrid: React.FC<AnalysisGridProps> = ({
  analyses,
  isLoading,
  limit,
  onSelectAnalysis,
  onEditAnalysis,
  onDeleteAnalysis,
  onResetFilters,
}) => {
  // Estado de carga inicial / cambio de página
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: limit }).map((_, index) => (
          <AnalysisCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // Estado vacío
  if (analyses.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-12 text-center my-8 max-w-lg mx-auto flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#1c2b3c] flex items-center justify-center text-[#7bd0ff] mb-4 border border-white/10">
          <span className="material-symbols-outlined text-[32px]">
            travel_explore
          </span>
        </div>
        <h3 className="font-['Montserrat'] font-bold text-lg text-[#d4e4fa] mb-2">
          No se encontraron análisis
        </h3>
        <p className="font-['Inter'] text-xs sm:text-sm text-[#c6c6cd] mb-6 max-w-sm">
          No hay estudios que coincidan con los criterios de búsqueda o categoría seleccionados en la base de datos.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center gap-2 bg-[#1c2b3c] hover:bg-[#273647] text-[#7bd0ff] border border-[#7bd0ff]/30 text-xs font-['Inter'] font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">
              refresh
            </span>
            Restablecer filtros
          </button>
        )}
      </div>
    );
  }

  // Cuadrícula activa con resultados
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {analyses.map((item) => (
        <AnalysisCard
          key={item.id}
          analysis={item}
          onClick={onSelectAnalysis}
          onEdit={onEditAnalysis}
          onDelete={onDeleteAnalysis}
        />
      ))}
    </div>
  );
};
