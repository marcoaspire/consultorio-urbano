import React from 'react';
import type { Project } from '../../../types/project';

interface ProjectCardProps {
  project: Project;
  onSelect: (slug: string) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const categoryName = project.category?.name || project.category_slug;
  const categoryIcon = project.category?.icon || 'folder';

  return (
    <article
      onClick={() => onSelect(project.slug)}
      className="group bg-[#122131]/90 hover:bg-[#16293d] border border-white/10 hover:border-[#7bd0ff]/40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#7bd0ff]/10 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1 relative"
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

        {/* Badge de Categoría Principal (Arriba Izquierda) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-['Inter'] font-semibold uppercase tracking-wider backdrop-blur-md border shadow-sm bg-[#7bd0ff]/10 text-[#7bd0ff] border-[#7bd0ff]/30"
          >
            <span className="material-symbols-outlined text-[14px]">
              {categoryIcon}
            </span>
            {categoryName}
          </span>
        </div>

        {/* Botones de Acción: Editar y Eliminar (Arriba Derecha) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }}
              title="Editar proyecto"
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
                onDelete(project);
              }}
              title="Eliminar proyecto (Soft Delete)"
              className="p-1.5 rounded-lg bg-[#051424]/85 hover:bg-red-600 text-[#bec6e0] hover:text-white backdrop-blur-md border border-white/20 shadow-md transition-colors cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px] block">
                delete
              </span>
            </button>
          )}
        </div>

        {/* Badge de Conteo de Entregas (Abajo Derecha) */}
        <div className="absolute bottom-2.5 right-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-['Inter'] font-medium text-[#d4e4fa] bg-[#051424]/85 backdrop-blur-md border border-white/20 shadow-md">
            <span className="material-symbols-outlined text-[#ec6a06] text-[14px]">
              layers
            </span>
            <span>
              {project.analyses_count === 1
                ? '1 análisis'
                : `${project.analyses_count} análisis`}
            </span>
          </span>
        </div>

        {/* Ciudad / Ubicación sobreimpresa al pie de la imagen (Abajo Izquierda) */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-xs text-[#bec6e0] font-['Inter']">
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
