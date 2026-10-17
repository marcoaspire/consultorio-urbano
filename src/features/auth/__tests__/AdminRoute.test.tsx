import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AdminRoute } from '../components/AdminRoute';
import * as useAuthHook from '../hooks/useAuth';

vi.mock('../hooks/useAuth');

describe('AdminRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe denegar el acceso y redirigir a un usuario lector/viewer a /', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-1',
        firstname: 'Viewer',
        lastname: 'User',
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
      <MemoryRouter initialEntries={['/admin-panel']}>
        <Routes>
          <Route
            path="/admin-panel"
            element={
              <AdminRoute>
                <div>Panel Super Secreto de Admin</div>
              </AdminRoute>
            }
          />
          <Route path="/" element={<div>Inicio Público</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Inicio Público')).toBeInTheDocument();
    expect(screen.queryByText('Panel Super Secreto de Admin')).not.toBeInTheDocument();
  });

  it('debe permitir acceso y renderizar contenido cuando el usuario es admin', () => {
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: 'usr-admin',
        firstname: 'Admin',
        lastname: 'Master',
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
      <MemoryRouter initialEntries={['/admin-panel']}>
        <AdminRoute>
          <div>Panel Super Secreto de Admin</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Panel Super Secreto de Admin')).toBeInTheDocument();
  });
});
