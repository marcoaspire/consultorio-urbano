import React from 'react';

interface GalleryPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (newPage: number) => void;
  isLoading: boolean;
}

export const GalleryPagination: React.FC<GalleryPaginationProps> = ({
  page,
  totalPages,
  total,
  limit,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  isLoading,
}) => {
  if (total === 0) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generador de lista de páginas
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Paginación de resultados"
      className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      {/* Información de rango paginado */}
      <div className="flex items-center gap-2 text-xs font-['Inter'] text-[#909097]">
        <span>
          Mostrando <strong className="text-[#d4e4fa] font-semibold">{startItem}</strong> -{' '}
          <strong className="text-[#d4e4fa] font-semibold">{endItem}</strong> de{' '}
          <strong className="text-[#d4e4fa] font-semibold">{total}</strong> análisis
        </span>
        <span className="hidden md:inline text-white/20">•</span>
        <span className="hidden md:inline text-[11px] text-[#7bd0ff]/80 bg-[#7bd0ff]/10 px-2 py-0.5 rounded">
          Paginado en Servidor
        </span>
      </div>

      {/* Controles de página */}
      <div className="flex items-center gap-1.5">
        {/* Botón Anterior */}
        <button
          type="button"
          disabled={!hasPrevPage || isLoading}
          onClick={() => onPageChange(page - 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-['Inter'] font-medium bg-[#122131] hover:bg-[#1c2b3c] text-[#d4e4fa] disabled:opacity-40 disabled:pointer-events-none border border-white/5 transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            chevron_left
          </span>
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Botones numéricos de página */}
        <div className="flex items-center gap-1">
          {pages.map((p) => {
            const isActive = p === page;
            return (
              <button
                key={p}
                type="button"
                disabled={isLoading}
                onClick={() => onPageChange(p)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-['Inter'] font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#7bd0ff] text-[#001a27] font-bold shadow-md shadow-[#7bd0ff]/20'
                    : 'bg-[#122131] hover:bg-[#1c2b3c] text-[#c6c6cd] hover:text-[#d4e4fa] border border-white/5'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        <button
          type="button"
          disabled={!hasNextPage || isLoading}
          onClick={() => onPageChange(page + 1)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-['Inter'] font-medium bg-[#122131] hover:bg-[#1c2b3c] text-[#d4e4fa] disabled:opacity-40 disabled:pointer-events-none border border-white/5 transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
        </button>
      </div>
    </nav>
  );
};
