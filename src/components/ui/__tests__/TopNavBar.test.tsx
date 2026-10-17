import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TopNavBar } from '../TopNavBar';
import * as useAuthHook from '../../../features/auth/hooks/useAuth';

vi.mock('../../../features/auth/hooks/useAuth');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('TopNavBar (Control de Roles y Estado Público)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el botón de "Acceso Admin" cuando el usuario NO está autenticado', async () => {
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

    render(
      <MemoryRouter>
        <TopNavBar />
      </MemoryRouter>
    );

    const loginBtn = screen.getByRole('button', { name: /Acceso Admin/i });
    expect(loginBtn).toBeInTheDocument();

    const user = userEvent.setup();
    await act(async () => {
      await user.click(loginBtn);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('debe mostrar el botón de acción principal si el usuario es administrador', async () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-admin',
        firstname: 'Marco',
        lastname: 'P',
        email: 'admin@test.com',
        role: 'admin',
        created_at: '',
        updated_at: '',
      },
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

    const onActionClickMock = vi.fn();

    render(
      <MemoryRouter>
        <TopNavBar
          actionButtonText="Nuevo Análisis"
          onActionClick={onActionClickMock}
        />
      </MemoryRouter>
    );

    const actionButton = screen.getByRole('button', { name: /Nuevo Análisis/i });
    expect(actionButton).toBeInTheDocument();

    const user = userEvent.setup();
    await act(async () => {
      await user.click(actionButton);
    });

    expect(onActionClickMock).toHaveBeenCalledTimes(1);
  });

  it('debe OCULTAR el botón de acción principal si el usuario es un lector (viewer) o visitante anónimo', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-viewer',
        firstname: 'Cliente',
        lastname: 'Externo',
        email: 'viewer@test.com',
        role: 'viewer',
        created_at: '',
        updated_at: '',
      },
      session: {} as never,
      role: 'viewer',
      isAdmin: false,
      isViewer: true,
      login: vi.fn(),
      loginWithMicrosoft: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TopNavBar actionButtonText="Nuevo Análisis" />
      </MemoryRouter>
    );

    expect(screen.queryByRole('button', { name: /Nuevo Análisis/i })).not.toBeInTheDocument();
  });

  it('debe mostrar el badge "Administrador" en el menú de usuario de un admin', async () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-admin',
        firstname: 'Admin',
        lastname: 'Urbano',
        email: 'admin@test.com',
        role: 'admin',
        created_at: '',
        updated_at: '',
      },
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

    render(
      <MemoryRouter>
        <TopNavBar />
      </MemoryRouter>
    );

    const userButton = screen.getByTitle(/Admin Urbano/i);
    expect(userButton).toBeInTheDocument();

    const user = userEvent.setup();
    await act(async () => {
      await user.click(userButton);
    });

    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
  });

  it('debe mostrar el badge "Lector / Viewer" en el menú de usuario de un lector', async () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-viewer',
        firstname: 'Lector',
        lastname: 'Demo',
        email: 'lector@test.com',
        role: 'viewer',
        created_at: '',
        updated_at: '',
      },
      session: {} as never,
      role: 'viewer',
      isAdmin: false,
      isViewer: true,
      login: vi.fn(),
      loginWithMicrosoft: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TopNavBar />
      </MemoryRouter>
    );

    const userButton = screen.getByTitle(/Lector Demo/i);
    const user = userEvent.setup();
    await act(async () => {
      await user.click(userButton);
    });

    expect(screen.getByText('Lector / Viewer')).toBeInTheDocument();
    expect(screen.getByText('lector@test.com')).toBeInTheDocument();
  });

  it('debe permitir cerrar sesión al hacer clic en Cerrar Sesión', async () => {
    const logoutMock = vi.fn().mockResolvedValue(undefined);

    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-1',
        firstname: 'Demo',
        lastname: 'User',
        email: 'demo@test.com',
        role: 'admin',
        created_at: '',
        updated_at: '',
      },
      session: {} as never,
      role: 'admin',
      isAdmin: true,
      isViewer: false,
      login: vi.fn(),
      loginWithMicrosoft: vi.fn(),
      register: vi.fn(),
      logout: logoutMock,
      refreshProfile: vi.fn(),
    });

    render(
      <MemoryRouter>
        <TopNavBar />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByTitle(/Demo User/i));
    });

    const logoutButton = screen.getByRole('button', { name: /Cerrar Sesión/i });
    await act(async () => {
      await user.click(logoutButton);
    });

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
