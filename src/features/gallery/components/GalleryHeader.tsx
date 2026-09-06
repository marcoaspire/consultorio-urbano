import React from 'react';
import type { Project } from '../../../types/project';

interface GalleryHeaderProps {
  totalCount: number;
  isLoading: boolean;
  project?: Project | null;
  onBackToProjects?: () => void;
}

export const GalleryHeader: React.FC<GalleryHeaderProps> = ({
  totalCount,
  isLoading,
  project,
  onBackToProjects,
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
      <div className="space-y-2">
        {/* Breadcrumb y Nivel */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-['Inter']">
          <button
            type="button"
            onClick={onBackToProjects}
            className="text-[#7bd0ff] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-[15px]">
              arrow_back
            </span>
            <span>Portafolio de Proyectos</span>
          </button>
          <span className="text-[#909097]">/</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#7bd0ff]/10 text-[#7bd0ff] border border-[#7bd0ff]/30">
            Nivel 2: Índice de Análisis
          </span>
          {project && (
            <>
              <span className="text-[#909097]">•</span>
              <span className="text-[#bec6e0] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#7bd0ff]">
                  pin_drop
                </span>
                <span>{project.location}</span>
              </span>
            </>
          )}
        </div>

        {/* Título Principal */}
        <h1 className="font-['Montserrat'] font-bold text-3xl sm:text-4xl text-[#d4e4fa] tracking-tight">
          {project ? project.name : 'Galería de Análisis'}
        </h1>

        {/* Descripción */}
        <p className="font-['Inter'] text-sm sm:text-base text-[#c6c6cd] max-w-2xl leading-relaxed">
          {project?.description
            ? project.description
            : 'Explora los estudios geoespaciales recientes, flujos de movilidad y mapas de calor procesados por la plataforma.'}
        </p>
      </div>

      {/* Tarjeta de Contador de Estudios / Entregas */}
      <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
        <div className="bg-[#122131]/80 backdrop-blur-md border border-white/10 rounded-lg px-3.5 py-2 flex items-center gap-2.5">
          <span className="material-symbols-outlined text-[#7bd0ff] text-[18px]">
            dataset
          </span>
          <div className="flex flex-col">
            <span className="font-['Inter'] text-[10px] uppercase tracking-wider text-[#909097] font-medium">
              Entregas del Proyecto
            </span>
            <span className="font-['Montserrat'] font-semibold text-xs text-[#d4e4fa]">
              {isLoading
                ? 'Consultando...'
                : totalCount === 1
                ? '1 Estudio disponible'
                : `${totalCount} Estudios disponibles`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

