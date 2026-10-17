import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import * as useAuthHook from '../hooks/useAuth';

vi.mock('../hooks/useAuth');

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe renderizar la pantalla de carga sin parpadeos mientras isLoading === true', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
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
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Contenido Protegido</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Verificando permisos y sesión...')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
  });

  it('debe redirigir a /login cuando el usuario no está autenticado', () => {
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
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Contenido Protegido</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Pantalla de Inicio de Sesión</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Pantalla de Inicio de Sesión')).toBeInTheDocument();
    expect(screen.queryByText('Contenido Protegido')).not.toBeInTheDocument();
  });

  it('debe renderizar el contenido protegido cuando el usuario está autenticado', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-1',
        firstname: 'Marco',
        lastname: 'P',
        email: 'user@test.com',
        role: 'viewer',
        created_at: '',
        updated_at: '',
      },
      session: { access_token: 'token' } as never,
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
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Contenido Protegido para Autenticados</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Contenido Protegido para Autenticados')).toBeInTheDocument();
  });

  it('debe redirigir al fallback (ej. /proyectos) con estado de restricción si la ruta exige requireAdmin y el rol es viewer', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-viewer',
        firstname: 'Lector',
        lastname: 'Externo',
        email: 'viewer@test.com',
        role: 'viewer',
        created_at: '',
        updated_at: '',
      },
      session: { access_token: 'token' } as never,
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
      <MemoryRouter initialEntries={['/nuevo']}>
        <Routes>
          <Route
            path="/nuevo"
            element={
              <ProtectedRoute requireAdmin redirectTo="/proyectos">
                <div>Formulario Exclusivo de Admin</div>
              </ProtectedRoute>
            }
          />
          <Route path="/proyectos" element={<div>Galería de Proyectos</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Galería de Proyectos')).toBeInTheDocument();
    expect(screen.queryByText('Formulario Exclusivo de Admin')).not.toBeInTheDocument();
  });

  it('debe permitir el acceso al contenido administrativo cuando requireAdmin === true e isAdmin === true', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-admin',
        firstname: 'Admin',
        lastname: 'Root',
        email: 'admin@test.com',
        role: 'admin',
        created_at: '',
        updated_at: '',
      },
      session: { access_token: 'token' } as never,
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
      <MemoryRouter initialEntries={['/nuevo']}>
        <ProtectedRoute requireAdmin redirectTo="/proyectos">
          <div>Formulario Exclusivo de Admin</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Formulario Exclusivo de Admin')).toBeInTheDocument();
  });
});
