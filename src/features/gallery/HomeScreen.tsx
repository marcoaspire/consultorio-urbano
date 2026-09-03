import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopNavBar } from '../../components/ui/TopNavBar';
import { AnalysisGrid } from './components/AnalysisGrid';
import { FilterBar } from './components/FilterBar';
import { GalleryHeader } from './components/GalleryHeader';
import { GalleryPagination } from './components/GalleryPagination';
import { useAnalyses } from './hooks/useAnalyses';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
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
  } = useAnalyses({ initialLimit: 8 });

  const [notification, setNotification] = useState<string | null>(null);

  const handleClearFilters = () => {
    setCategory('todos');
    setStatus('todos');
    setSearch('');
  };

  const handleNewAnalysis = () => {
    navigate('/nuevo');
  };


  const isFiltered =
    category !== 'todos' || status !== 'todos' || Boolean(search.trim());

  return (
    <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col antialiased">
      {/* Barra de Navegación Superior Única (Regla UX best-practices.md) */}
      <TopNavBar
        search={search}
        onSearchChange={setSearch}
        onNewAnalysisClick={handleNewAnalysis}
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

      {/* Contenedor Principal de la Galería */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {/* Encabezado de la Galería */}
        <GalleryHeader
          totalCount={pagination.total}
          isLoading={isLoading}
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
          <AnalysisGrid
            analyses={analyses}
            isLoading={isLoading}
            limit={pagination.limit}
            onSelectAnalysis={(item) => navigate(`/analisis/${item.slug}`)}
            onResetFilters={handleClearFilters}
          />
        </div>

        {/* Paginación del Lado del Servidor */}
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
      </main>
    </div>
  );
};
