import React from 'react';

interface GalleryHeaderProps {
  totalCount: number;
  isLoading: boolean;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  totalCount,
  isLoading,
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#7bd0ff] shadow-sm shadow-[#7bd0ff]"></span>
          <span className="font-['Inter'] text-[12px] uppercase tracking-widest text-[#7bd0ff] font-semibold">
            Plataforma Geoespacial
          </span>
        </div>
        <h1 className="font-['Montserrat'] font-bold text-3xl sm:text-4xl text-[#d4e4fa] tracking-tight mb-2">
          Galería de Análisis
        </h1>
        <p className="font-['Inter'] text-sm sm:text-base text-[#c6c6cd] max-w-2xl leading-relaxed">
          Explora los estudios geoespaciales recientes, flujos de movilidad y mapas de calor procesados por la plataforma.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-[#122131]/80 backdrop-blur-md border border-white/10 rounded-lg px-3.5 py-2 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#7bd0ff] text-[18px]">
            dataset
          </span>
          <div className="flex flex-col">
            <span className="font-['Inter'] text-[10px] uppercase tracking-wider text-[#909097] font-medium">
              Base de Datos
            </span>
            <span className="font-['Montserrat'] font-semibold text-xs text-[#d4e4fa]">
              {isLoading ? 'Consultando...' : `${totalCount} Estudios`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
