import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '../../components/ui/TopNavBar';
import { categoriesService } from '../../services/categories.service';
import { projectsService } from '../../services/projects.service';
import type { Category } from '../../types/category';
import type { CreateProjectDTO, Project } from '../../types/project';
import { NewProjectModal } from './components/NewProjectModal';
import { ProjectCard } from './components/ProjectCard';
import { ProjectCardSkeleton } from './components/ProjectCardSkeleton';

export const ProjectsPortfolioScreen: React.FC = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categorySlug, setCategorySlug] = useState<string>('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar lista de categorías para pestañas
  useEffect(() => {
    let ignore = false;
    categoriesService
      .getCategories('project')
      .then((data) => {
        if (!ignore) setCategories(data);
      })
      .catch((err) => {
        console.error('Error al cargar categorías de proyectos:', err);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Debounce para la barra de búsqueda en memoria (200ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 200);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setIsLoading(true);
      try {
        const data = await projectsService.getProjects({
          search: debouncedSearch,
          category_slug: categorySlug,
        });
        if (!ignore) {
          setProjects(data);
        }
      } catch {
        if (!ignore) {
          setProjects([]);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, categorySlug]);

  // Manejo de creación de nuevo proyecto
  const handleCreateProject = async (dto: CreateProjectDTO) => {
    const created = await projectsService.createProject(dto);
    setIsModalOpen(false);
    // Redirige automáticamente al Nivel 2 del nuevo proyecto
    navigate(`/proyectos/${created.slug}`);
  };

  const handleSelectProject = (slug: string) => {
    navigate(`/proyectos/${slug}`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategorySlug('todos');
  };

  const isFiltered = categorySlug !== 'todos' || Boolean(search.trim());

  // Métricas rápidas del portafolio
  const totalDeliveries = useMemo(() => {
    return projects.reduce((acc, p) => acc + (p.analyses_count || 0), 0);
  }, [projects]);

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col antialiased">
      {/* Barra de Navegación Superior (Nivel 1: Portafolio Global) */}
      <TopNavBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar proyectos por nombre, ciudad o descripción..."
        actionButtonText="Nuevo Proyecto"
        onActionClick={() => setIsModalOpen(true)}
        onBrandClick={handleClearFilters}
      />

      {/* Contenedor Central */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        {/* Encabezado del Portafolio Global */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-['Inter'] font-semibold uppercase tracking-wider bg-[#7bd0ff]/10 text-[#7bd0ff] border border-[#7bd0ff]/30">
                Nivel 1: Portafolio Territorial
              </span>
              <span className="text-xs text-[#909097] font-['Inter']">•</span>
              <span className="text-xs text-[#bec6e0] font-['Inter']">
                {isLoading ? 'Cargando...' : `${projects.length} proyectos registrados`}
              </span>
            </div>
            <h1 className="font-['Montserrat'] font-extrabold text-2xl sm:text-3xl text-[#d4e4fa] tracking-tight">
              Portafolio Global de Proyectos
            </h1>
            <p className="font-['Inter'] text-sm text-[#909097] leading-relaxed">
              Explora los terrenos e intervenciones activas. Selecciona un proyecto para acceder a su índice de análisis multitemporales, comparador visual y reportes técnicos en PDF.
            </p>
          </div>

          {/* Tarjeta de Métricas Rápidas */}
          <div className="flex items-center gap-3 bg-[#122131]/80 border border-white/10 rounded-xl p-3 px-4 shadow-md shrink-0 self-start md:self-auto">
            <div className="w-10 h-10 rounded-lg bg-[#ec6a06]/15 border border-[#ec6a06]/30 flex items-center justify-center text-[#ec6a06]">
              <span className="material-symbols-outlined text-[22px]">
                monitoring
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Montserrat'] font-bold text-lg text-[#d4e4fa] leading-tight">
                {totalDeliveries}
              </span>
              <span className="font-['Inter'] text-[11px] text-[#909097]">
                Entregas disponibles
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Filtros por Categoría Dinámica */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setCategorySlug('todos')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-['Inter'] font-medium transition-all duration-200 cursor-pointer ${
                categorySlug === 'todos'
                  ? 'bg-[#7bd0ff] text-[#051424] font-semibold shadow-md shadow-[#7bd0ff]/20'
                  : 'bg-[#122131]/80 hover:bg-[#1c2b3c] text-[#bec6e0] border border-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                grid_view
              </span>
              <span>Todos los Proyectos</span>
            </button>

            {categories.map((cat) => {
              const isActive = categorySlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategorySlug(cat.slug)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-['Inter'] font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#7bd0ff] text-[#051424] font-semibold shadow-md shadow-[#7bd0ff]/20'
                      : 'bg-[#122131]/80 hover:bg-[#1c2b3c] text-[#bec6e0] border border-white/5'
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

          {/* Botón para limpiar filtros activos */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-xs text-[#ec6a06] hover:text-[#ffb690] font-['Inter'] font-medium cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">
                filter_alt_off
              </span>
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Cuadrícula de Proyectos / Skeletons */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 4 }).map((_, idx) => (
                <ProjectCardSkeleton key={idx} />
              ))}
            </div>
          ) : projects.length === 0 ? (
            /* Estado Vacío cuando la búsqueda no tiene resultados */
            <div className="py-16 text-center flex flex-col items-center justify-center gap-4 bg-[#122131]/30 border border-white/5 rounded-2xl p-8">
              <div className="w-14 h-14 rounded-full bg-[#1c2b3c] flex items-center justify-center text-[#909097]">
                <span className="material-symbols-outlined text-[32px]">
                  travel_explore
                </span>
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="font-['Montserrat'] font-bold text-base text-[#d4e4fa]">
                  No se encontraron proyectos
                </h3>
                <p className="font-['Inter'] text-xs text-[#909097]">
                  No hay proyectos que coincidan con los filtros aplicados. Puedes restablecer los criterios o crear un nuevo proyecto.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                {isFiltered && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="px-4 py-2 rounded-lg text-xs font-['Inter'] font-semibold bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] transition-colors cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-['Inter'] font-semibold bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white shadow-md transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    add
                  </span>
                  <span>+ Nuevo Proyecto</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onSelect={handleSelectProject}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal Glassmorphism de Creación de Proyecto */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
};
