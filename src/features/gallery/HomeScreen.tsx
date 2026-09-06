import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TopNavBar } from '../../components/ui/TopNavBar';
import { projectsService } from '../../services/projects.service';
import type { Project } from '../../types/project';
import { AnalysisGrid } from './components/AnalysisGrid';
import { FilterBar } from './components/FilterBar';
import { GalleryHeader } from './components/GalleryHeader';
import { GalleryPagination } from './components/GalleryPagination';
import { useAnalyses } from './hooks/useAnalyses';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { projectSlug } = useParams<{ projectSlug: string }>();

  // Estado del proyecto actual (Nivel 2)
  const [project, setProject] = useState<Project | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(Boolean(projectSlug));

  useEffect(() => {
    let ignore = false;

    async function loadProject() {
      if (!projectSlug) {
        setProject(null);
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);
      try {
        const found = await projectsService.getProjectBySlug(projectSlug);
        if (!ignore) {
          setProject(found);
        }
      } catch {
        if (!ignore) {
          setProject(null);
        }
      } finally {
        if (!ignore) {
          setIsProjectLoading(false);
        }
      }
    }

    loadProject();

    return () => {
      ignore = true;
    };
  }, [projectSlug]);

  const {
    analyses,
    pagination,
    isLoading,
    category,
    status,
    search,
    setPage,
    setCategory,
    setStatus,
    setSearch,
  } = useAnalyses({
    initialLimit: 8,
    projectSlug,
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleClearFilters = () => {
    setCategory('todos');
    setStatus('todos');
    setSearch('');
  };

  const handleNewAnalysis = () => {
    if (projectSlug) {
      navigate(`/nuevo?project=${projectSlug}`);
    } else {
      navigate('/nuevo');
    }
  };

  const isFiltered =
    category !== 'todos' || status !== 'todos' || Boolean(search.trim());

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col antialiased">
      {/* Barra de Navegación Superior (Nivel 2: Índice de Análisis con Retorno a Proyectos) */}
      <TopNavBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar análisis por ciudad, tipo o fecha..."
        actionButtonText="Nuevo Análisis"
        onActionClick={handleNewAnalysis}
        showBackButton={true}
        backLabel="Volver a Proyectos"
        onBackClick={() => navigate('/')}
        onBrandClick={() => navigate('/')}
      />

      {/* Banner de Notificación / Toast para acciones */}
      {notification && (
        <div className="bg-[#122131] border-b border-[#ec6a06]/40 text-[#ffb690] px-4 py-2.5 text-xs sm:text-sm font-['Inter'] flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 max-w-[1600px] mx-auto w-full">
            <span className="material-symbols-outlined text-[#ec6a06] text-[18px]">
              info
            </span>
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-[#909097] hover:text-white cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Contenedor Principal del Índice de Análisis */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Encabezado contextual con migas de pan y metadata del proyecto */}
        <GalleryHeader
          totalCount={pagination.total}
          isLoading={isLoading || isProjectLoading}
          project={project}
          onBackToProjects={() => navigate('/')}
        />

        {/* Barra de Filtros y Categorías */}
        <FilterBar
          currentCategory={category}
          onSelectCategory={setCategory}
          currentStatus={status}
          onSelectStatus={setStatus}
          onClearFilters={handleClearFilters}
          isFiltered={isFiltered}
        />

        {/* Cuadrícula de Análisis (o Skeletons) */}
        <div className="flex-1">
          {/* Si el proyecto recién creado no tiene análisis y no está filtrado */}
          {!isLoading && analyses.length === 0 && !isFiltered ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-4 bg-[#122131]/30 border border-white/5 rounded-2xl p-8 my-4">
              <div className="w-16 h-16 rounded-full bg-[#1c2b3c] flex items-center justify-center text-[#7bd0ff] border border-white/10">
                <span className="material-symbols-outlined text-[32px]">
                  satellite_alt
                </span>
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-['Montserrat'] font-bold text-lg text-[#d4e4fa]">
                  No hay análisis subidos para este proyecto aún
                </h3>
                <p className="font-['Inter'] text-xs text-[#909097] leading-relaxed">
                  Comienza publicando el primer estudio geoespacial, ortomosaico o comparativa antes/después para este territorio.
                </p>
              </div>
              <button
                type="button"
                onClick={handleNewAnalysis}
                className="flex items-center gap-2 bg-[#ec6a06] hover:bg-[#ffb690] hover:text-[#552100] text-white font-['Inter'] font-semibold text-xs py-2.5 px-5 rounded-lg shadow-md shadow-[#ec6a06]/20 transition-all cursor-pointer mt-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                <span>+ Subir Primer Análisis</span>
              </button>
            </div>
          ) : (
            <AnalysisGrid
              analyses={analyses}
              isLoading={isLoading}
              limit={pagination.limit}
              onSelectAnalysis={(item) => navigate(`/analisis/${item.slug}`)}
              onResetFilters={handleClearFilters}
            />
          )}
        </div>

        {/* Paginación del Lado del Servidor */}
        {pagination.totalPages > 1 && (
          <GalleryPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            hasNextPage={pagination.hasNextPage}
            hasPrevPage={pagination.hasPrevPage}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
};
