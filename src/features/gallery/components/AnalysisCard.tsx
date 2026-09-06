import React from 'react';
import type { Analysis } from '../../../types/analysis';

interface AnalysisCardProps {
  analysis: Analysis;
  onClick?: (analysis: Analysis) => void;
  onEdit?: (analysis: Analysis) => void;
  onDelete?: (analysis: Analysis) => void;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  analysis,
  onClick,
  onEdit,
  onDelete,
}) => {
  const categoryName = analysis.category?.name || analysis.category_slug;
  const categoryIcon = analysis.category?.icon || 'insights';

  const hasPdf = analysis.assets?.some((a) => a.asset_type === 'pdf_report');
  const hasMultipleImages =
    (analysis.assets?.filter(
      (a) => a.asset_type === 'image_before' || a.asset_type === 'image_after'
    ).length ?? 0) >= 2;

  return (
    <article
      onClick={() => onClick?.(analysis)}
      className="glass-panel rounded-xl overflow-hidden flex flex-col card-hover transition-all duration-300 cursor-pointer group relative"
    >
      {/* Visual Canvas / Thumbnail */}
      <div className="h-48 relative overflow-hidden bg-[#1c2b3c]">
        <img
          src={
            analysis.thumbnail_url ||
            'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80'
          }
          alt={analysis.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-all duration-500 scale-105 group-hover:scale-100"
        />

        {/* City Location Pill (Arriba Izquierda) */}
        <div className="absolute top-3 left-3 bg-[#051424]/80 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-[11px] font-['Inter'] text-[#c6c6cd] flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px] text-[#7bd0ff]">
            location_on
          </span>
          <span>{analysis.city}</span>
        </div>

        {/* Botones Flotantes de Edición y Eliminación Lógica (Arriba Derecha) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(analysis);
              }}
              title="Editar análisis"
              className="p-1.5 rounded-lg bg-[#051424]/85 hover:bg-[#7bd0ff] text-[#bec6e0] hover:text-[#051424] backdrop-blur-md border border-white/20 shadow-md transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] block">
                edit
              </span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(analysis);
              }}
              title="Eliminar análisis (Soft Delete)"
              className="p-1.5 rounded-lg bg-[#051424]/85 hover:bg-red-600 text-[#bec6e0] hover:text-white backdrop-blur-md border border-white/20 shadow-md transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] block">
                delete
              </span>
            </button>
          )}
        </div>

        {/* Indicator tags on bottom edge of image */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
          {hasMultipleImages && (
            <span
              title="Comparador Antes / Después disponible"
              className="bg-[#051424]/85 backdrop-blur-md text-[#7bd0ff] px-1.5 py-0.5 rounded text-[10px] font-['Inter'] font-semibold flex items-center gap-0.5 border border-white/10"
            >
              <span className="material-symbols-outlined text-[12px]">
                compare
              </span>
              2 Tomas
            </span>
          )}
          {hasPdf && (
            <span
              title="Reporte PDF adjunto"
              className="bg-[#051424]/85 backdrop-blur-md text-[#ffb690] px-1.5 py-0.5 rounded text-[10px] font-['Inter'] font-semibold flex items-center gap-0.5 border border-white/10"
            >
              <span className="material-symbols-outlined text-[12px]">
                picture_as_pdf
              </span>
              PDF
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Category Header */}
        <div className="flex items-center gap-1.5 mb-2.5 text-[#7bd0ff]">
          <span
            className="material-symbols-outlined text-[18px]"
            data-icon={categoryIcon}
          >
            {categoryIcon}
          </span>
          <span className="font-['Inter'] text-[12px] font-semibold tracking-wider uppercase">
            {categoryName}
          </span>
        </div>

        {/* Study Title */}
        <h2 className="font-['Montserrat'] font-semibold text-[18px] leading-snug text-[#d4e4fa] mb-2 group-hover:text-[#7bd0ff] transition-colors">
          {analysis.title}
        </h2>

        {/* Description */}
        <p className="font-['Inter'] text-[14px] leading-relaxed text-[#c6c6cd] mb-4 flex-1 line-clamp-3">
          {analysis.description}
        </p>

        {/* Card Footer */}
        <div className="flex items-center justify-between mt-auto pt-3.5 border-t border-white/5">
          <span className="font-['Inter'] text-[12px] text-[#909097] font-medium">
            {analysis.relative_time || 'Reciente'}
          </span>
          <div className="flex items-center gap-1 text-[#909097] group-hover:text-[#7bd0ff] transition-colors">
            <span className="text-[12px] font-['Inter'] font-medium hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">
              Inspeccionar
            </span>
            <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
