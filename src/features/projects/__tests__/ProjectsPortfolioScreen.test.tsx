import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProjectsPortfolioScreen } from '../ProjectsPortfolioScreen';
import { projectsService } from '../../../services/projects.service';
import { categoriesService } from '../../../services/categories.service';
import * as useAuthHook from '../../auth/hooks/useAuth';

vi.mock('../../../services/projects.service');
vi.mock('../../../services/categories.service');
vi.mock('../../auth/hooks/useAuth');

describe('ProjectsPortfolioScreen (Control de Roles y Vista Pública)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(categoriesService.getCategories).mockResolvedValue([
      { name: 'Medio Ambiente', slug: 'medio-ambiente', scope: 'project' },
    ]);
  });

  it('debe mostrar el botón "+ Nuevo Proyecto" en estado vacío cuando el usuario es admin', async () => {
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

    vi.mocked(projectsService.getProjects).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProjectsPortfolioScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No se encontraron proyectos')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /\+ Nuevo Proyecto/i })).toBeInTheDocument();
  });

  it('debe OCULTAR el botón "+ Nuevo Proyecto" en estado vacío cuando el usuario es lector o anónimo', async () => {
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

    vi.mocked(projectsService.getProjects).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <ProjectsPortfolioScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No se encontraron proyectos')).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /\+ Nuevo Proyecto/i })).not.toBeInTheDocument();
  });
});
