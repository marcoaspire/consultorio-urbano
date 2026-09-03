import { useCallback, useEffect, useState } from 'react';
import { analysesService } from '../../../services/analyses.service';
import type {
  Analysis,
  AnalysisCategory,
  AnalysisStatus,
  PaginatedResponse,
} from '../../../types/analysis';


interface UseAnalysesOptions {
  initialLimit?: number;
  initialCategory?: AnalysisCategory | 'todos';
}

export function useAnalyses(options: UseAnalysesOptions = {}) {
  const { initialLimit = 8, initialCategory = 'todos' } = options;

  const [page, setPageState] = useState(1);
  const [limit] = useState(initialLimit);
  const [category, setCategoryState] = useState<AnalysisCategory | 'todos'>(
    initialCategory
  );
  const [status, setStatusState] = useState<AnalysisStatus | 'todos'>('todos');
  const [search, setSearchState] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [data, setData] = useState<Analysis[]>([]);
  const [pagination, setPagination] = useState<
    Omit<PaginatedResponse<Analysis>, 'data'>
  >({
    total: 0,
    page: 1,
    limit: initialLimit,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce para la búsqueda textual (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Al cambiar filtros o búsqueda, reiniciar a la página 1 y activar estado de carga
  const setPage = useCallback((newPage: number) => {
    setIsLoading(true);
    setPageState(newPage);
  }, []);

  const setCategory = useCallback(
    (newCategory: AnalysisCategory | 'todos') => {
      setIsLoading(true);
      setCategoryState(newCategory);
      setPageState(1);
    },
    []
  );

  const setSearch = useCallback((newSearch: string) => {
    setIsLoading(true);
    setSearchState(newSearch);
    setPageState(1);
  }, []);

  const setStatus = useCallback((newStatus: AnalysisStatus | 'todos') => {
    setIsLoading(true);
    setStatusState(newStatus);
    setPageState(1);
  }, []);

  // Función de consulta al backend
  const fetchAnalyses = useCallback(async () => {
    try {
      const response = await analysesService.getAnalyses({
        page,
        limit,
        category,
        status,
        search: debouncedSearch,
      });

      setData(response.data);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPrevPage: response.hasPrevPage,
      });
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error al cargar los análisis geoespaciales'
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, category, status, debouncedSearch]);

  useEffect(() => {
    let ignore = false;

    async function loadData() {
      try {
        const response = await analysesService.getAnalyses({
          page,
          limit,
          category,
          status,
          search: debouncedSearch,
        });

        if (!ignore) {
          setData(response.data);
          setPagination({
            total: response.total,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
            hasNextPage: response.hasNextPage,
            hasPrevPage: response.hasPrevPage,
          });
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : 'Error al cargar los análisis geoespaciales'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
    };
  }, [page, limit, category, status, debouncedSearch]);


  return {
    analyses: data,
    pagination,
    isLoading,
    error,
    page,
    category,
    status,
    search,
    setPage,
    setCategory,
    setStatus,
    setSearch,
    refetch: fetchAnalyses,
  };
}
