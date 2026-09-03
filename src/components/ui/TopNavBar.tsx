import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TopNavBarProps {
  search?: string;
  onSearchChange?: (value: string) => void;
  onNewAnalysisClick?: () => void;
  isDetailView?: boolean;
  onBackClick?: () => void;
  onBrandClick?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  search = '',
  onSearchChange,
  onNewAnalysisClick,
  isDetailView = false,
  onBackClick,
  onBrandClick,
}) => {
  const navigate = useNavigate();

  const handleBrandClick = () => {
    if (onBrandClick) {
      onBrandClick();
    } else {
      navigate('/');
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/');
    }
  };

  const handleNewClick = () => {
    if (onNewAnalysisClick) {
      onNewAnalysisClick();
    } else {
      navigate('/nuevo');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#051424]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo + Optional Back to Gallery Button */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleBrandClick}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7bd0ff] to-[#ec6a06] p-[2px] flex items-center justify-center shadow-md shadow-[#7bd0ff]/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#051424] rounded-[6px] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#7bd0ff] text-[20px]">
                  explore
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-['Montserrat'] font-bold text-lg text-[#d4e4fa] tracking-tight leading-tight group-hover:text-[#7bd0ff] transition-colors">
                Navegación Analítica
              </span>
              <span className="font-['Inter'] text-[11px] text-[#909097] uppercase tracking-wider font-semibold">
                Consultorio Urbano
              </span>
            </div>
          </div>

          {/* Botón Volver a la Galería en vista de Detalle o Carga */}
          {isDetailView && (
            <button
              type="button"
              onClick={handleBackClick}
              className="flex items-center gap-1.5 text-xs font-['Inter'] font-medium text-[#bec6e0] hover:text-[#d4e4fa] hover:bg-white/5 py-1 px-2.5 rounded-lg border-l border-white/15 ml-2 sm:ml-4 pl-3 sm:pl-4 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              <span>Volver a la Galería</span>
            </button>
          )}
        </div>

        {/* Central Search Bar (Visible en Galería) */}
        {!isDetailView && onSearchChange && (
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-[#909097] text-[20px] pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por ciudad, tipo o fecha..."
                className="w-full bg-[#1c2b3c]/80 hover:bg-[#1c2b3c] focus:bg-[#122131] border-b-2 border-[#273647] focus:border-[#7bd0ff] text-[#d4e4fa] placeholder-[#909097] font-['Inter'] text-sm py-2 pl-11 pr-9 rounded-t-md transition-all outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 text-[#909097] hover:text-[#d4e4fa] transition-colors cursor-pointer"
                  title="Limpiar búsqueda"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-3 ml-auto">
          {!isDetailView ? (
            <button
              type="button"
              onClick={handleNewClick}
              className="flex items-center gap-2 bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white font-['Inter'] font-semibold text-xs py-2 px-3.5 sm:px-4 rounded-md shadow-md shadow-[#ec6a06]/20 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span className="hidden sm:inline">Nuevo Análisis</span>
            </button>
          ) : (
            <button
              type="button"
              className="bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white font-['Inter'] font-semibold text-xs py-2 px-4 rounded-md shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Acceso
            </button>
          )}

          {/* Profile Avatar Icon */}
          <div
            className="w-9 h-9 rounded-full bg-[#1c2b3c] border border-white/10 flex items-center justify-center text-[#bec6e0] hover:border-[#7bd0ff]/40 transition-colors cursor-pointer"
            title="Perfil de usuario"
          >
            <span className="material-symbols-outlined text-[20px]">
              account_circle
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
