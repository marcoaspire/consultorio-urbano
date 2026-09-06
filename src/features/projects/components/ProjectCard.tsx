import React from 'react';
import type { Project, ProjectCategory } from '../../../types/project';

interface ProjectCardProps {
  project: Project;
  onSelect: (slug: string) => void;
}

const CATEGORY_STYLES: Record<
  ProjectCategory,
  { label: string; text: string; bg: string; border: string; icon: string }
> = {
  topografia: {
    label: 'Topografía',
    text: 'text-[#7bd0ff]',
    bg: 'bg-[#7bd0ff]/10',
    border: 'border-[#7bd0ff]/30',
    icon: 'landscape',
  },
  movilidad: {
    label: 'Movilidad',
    text: 'text-[#ffb690]',
    bg: 'bg-[#ec6a06]/15',
    border: 'border-[#ec6a06]/30',
    icon: 'traffic',
  },
  catastro: {
    label: 'Catastro',
    text: 'text-[#c3b5fd]',
    bg: 'bg-[#8b5cf6]/15',
    border: 'border-[#8b5cf6]/30',
    icon: 'map',
  },
  medio_ambiente: {
    label: 'Medio Ambiente',
    text: 'text-[#6ee7b7]',
    bg: 'bg-[#10b981]/15',
    border: 'border-[#10b981]/30',
    icon: 'park',
  },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
}) => {
  const catStyle = CATEGORY_STYLES[project.category] || CATEGORY_STYLES.topografia;

  return (
    <article
      onClick={() => onSelect(project.slug)}
      className="group bg-[#122131]/90 hover:bg-[#16293d] border border-white/10 hover:border-[#7bd0ff]/40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#7bd0ff]/10 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Contenedor de Imagen de Portada / Miniatura Satelital */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0a1827]">
        <img
          src={project.thumbnail_url}
          alt={project.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#122131] via-[#122131]/20 to-transparent" />

        {/* Badge de Categoría Principal */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-['Inter'] font-semibold uppercase tracking-wider backdrop-blur-md border shadow-sm ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
          >
            <span className="material-symbols-outlined text-[14px]">
              {catStyle.icon}
            </span>
            {catStyle.label}
          </span>
        </div>

        {/* Badge de Conteo de Entregas (Nivel 2 disponible) */}
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-['Inter'] font-medium text-[#d4e4fa] bg-[#051424]/85 backdrop-blur-md border border-white/20 shadow-md">
            <span className="material-symbols-outlined text-[#ec6a06] text-[15px]">
              layers
            </span>
            <span>
              {project.analyses_count === 1
                ? '1 análisis disponible'
                : `${project.analyses_count} análisis disponibles`}
            </span>
          </span>
        </div>

        {/* Ciudad / Ubicación sobreimpresa al pie de la imagen */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-xs text-[#bec6e0] font-['Inter']">
          <span className="material-symbols-outlined text-[#7bd0ff] text-[16px]">
            pin_drop
          </span>
          <span className="font-medium drop-shadow-sm">{project.location}</span>
        </div>
      </div>

      {/* Cuerpo de la Tarjeta */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Título del Proyecto */}
          <h3 className="font-['Montserrat'] font-bold text-lg text-[#d4e4fa] group-hover:text-[#7bd0ff] transition-colors leading-snug line-clamp-1">
            {project.name}
          </h3>

          {/* Descripción */}
          {project.description && (
            <p className="font-['Inter'] text-xs text-[#909097] line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Pie de la Tarjeta: Fecha y Enlace a Nivel 2 */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-[#909097] font-['Inter']">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px]">
              calendar_today
            </span>
            <span>{project.relative_time || 'Reciente'}</span>
          </div>

          <div className="flex items-center gap-1 text-[#7bd0ff] font-semibold group-hover:translate-x-0.5 transition-transform">
            <span>Ver Proyecto</span>
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};
