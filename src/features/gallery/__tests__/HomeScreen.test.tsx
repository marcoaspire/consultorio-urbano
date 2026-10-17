import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomeScreen } from '../HomeScreen';
import { projectsService } from '../../../services/projects.service';
import { categoriesService } from '../../../services/categories.service';
import * as useAuthHook from '../../auth/hooks/useAuth';
import * as useAnalysesHook from '../hooks/useAnalyses';

vi.mock('../../../services/projects.service');
vi.mock('../../../services/categories.service');
vi.mock('../../auth/hooks/useAuth');
vi.mock('../hooks/useAnalyses');

describe('HomeScreen (Control de Roles y Estado Vacío Público)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(categoriesService.getCategories).mockResolvedValue([]);
    vi.mocked(projectsService.getProjectBySlug).mockResolvedValue({
      id: 'proj-1',
      slug: 'valle-verde',
      name: 'Valle Verde',
      description: 'Proyecto de conservación',
      location: 'Antioquia',
      category_slug: 'medio-ambiente',
      thumbnail_url: '',
      analyses_count: 0,
      created_at: '',
      updated_at: '',
    });
  });

  it('debe mostrar el botón "+ Subir Primer Análisis" en estado vacío si el usuario es administrador', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { id: 'admin-1', firstname: 'Admin', lastname: '', email: 'a@test.com', role: 'admin', created_at: '', updated_at: '' },
      session: {} as never,
      role: 'admin',
      isAdmin: true,
      isViewer: false,
      login: vi.fn(),
      loginWithMicrosoft: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    });

    vi.spyOn(useAnalysesHook, 'useAnalyses').mockReturnValue({
      analyses: [],
      pagination: { total: 0, page: 1, limit: 8, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      isLoading: false,
      error: null,
      page: 1,
      category: 'todos',
      search: '',
      setPage: vi.fn(),
      setCategory: vi.fn(),
      setSearch: vi.fn(),
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/proyectos/valle-verde']}>
        <HomeScreen />
      </MemoryRouter>
    );

    expect(screen.getByText('No hay análisis subidos para este proyecto aún')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Subir Primer Análisis/i })).toBeInTheDocument();
  });

  it('debe OCULTAR el botón "+ Subir Primer Análisis" y mostrar mensaje informativo para lectores o visitantes anónimos', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      role: null,
      isAdmin: false,
      isViewer: false,
      login: vi.fn(),
      loginWithMicrosoft: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    });

    vi.spyOn(useAnalysesHook, 'useAnalyses').mockReturnValue({
      analyses: [],
      pagination: { total: 0, page: 1, limit: 8, totalPages: 1, hasNextPage: false, hasPrevPage: false },
      isLoading: false,
      error: null,
      page: 1,
      category: 'todos',
      search: '',
      setPage: vi.fn(),
      setCategory: vi.fn(),
      setSearch: vi.fn(),
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/proyectos/valle-verde']}>
        <HomeScreen />
      </MemoryRouter>
    );

    expect(screen.getByText('No hay análisis subidos para este proyecto aún')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /\+ Subir Primer Análisis/i })).not.toBeInTheDocument();
    expect(screen.getByText('Esperando publicación de entregas por el equipo técnico.')).toBeInTheDocument();
  });
});
