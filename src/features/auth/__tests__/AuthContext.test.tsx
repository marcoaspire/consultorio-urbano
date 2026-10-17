import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../../../services/auth.service';
import type { Session } from '@supabase/supabase-js';
import type { User } from '../../../types/user';

vi.mock('../../../services/auth.service', () => ({
  authService: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    getUserProfile: vi.fn(),
    signIn: vi.fn(),
    signInWithMicrosoft: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}));

const TestConsumer: React.FC = () => {
  const { user, session, isAuthenticated, isLoading, role, isAdmin, isViewer, login, logout, loginWithMicrosoft } = useAuth();

  if (isLoading) {
    return <div data-testid="loading-state">Cargando contexto...</div>;
  }

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Autenticado' : 'No autenticado'}</div>
      <div data-testid="user-email">{user?.email || 'Sin usuario'}</div>
      <div data-testid="user-role">{role || 'Sin rol'}</div>
      <div data-testid="is-admin">{isAdmin ? 'true' : 'false'}</div>
      <div data-testid="is-viewer">{isViewer ? 'true' : 'false'}</div>
      <div data-testid="session-token">{session?.access_token || 'Sin token'}</div>

      <button
        onClick={() =>
          login({ email: 'admin@consultorio.com', password: 'password123' })
        }
      >
        Iniciar Sesión
      </button>

      <button onClick={() => logout()}>Cerrar Sesión</button>

      <button onClick={() => loginWithMicrosoft('/custom-redirect')}>
        Login con Microsoft
      </button>
    </div>
  );
};

describe('AuthContext & AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authService.onAuthStateChange).mockReturnValue({
      id: 'sub-test',
      callback: vi.fn(),
      unsubscribe: vi.fn(),
    });
  });

  it('debe mostrar estado de carga inicial mientras se resuelve la sesión', async () => {
    vi.mocked(authService.getSession).mockReturnValueOnce(new Promise(() => {}));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('debe resolver usuario no autenticado cuando no existe sesión activa', async () => {
    vi.mocked(authService.getSession).mockResolvedValueOnce(null);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('No autenticado');
    expect(screen.getByTestId('user-role')).toHaveTextContent('Sin rol');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    expect(screen.getByTestId('is-viewer')).toHaveTextContent('false');
  });

  it('debe resolver correctamente el rol admin y exponer isAdmin === true', async () => {
    const mockSession = {
      access_token: 'valid-admin-token',
      user: { id: 'usr-admin-1', email: 'admin@consultorio.com' },
    } as unknown as Session;

    const mockAdminUser: User = {
      id: 'usr-admin-1',
      firstname: 'Marco',
      lastname: 'Pacheco',
      email: 'admin@consultorio.com',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(authService.getSession).mockResolvedValueOnce(mockSession);
    vi.mocked(authService.getUserProfile).mockResolvedValueOnce(mockAdminUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@consultorio.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    expect(screen.getByTestId('is-viewer')).toHaveTextContent('false');
  });

  it('debe resolver correctamente el rol viewer y exponer isViewer === true', async () => {
    const mockSession = {
      access_token: 'valid-viewer-token',
      user: { id: 'usr-viewer-1', email: 'viewer@consultorio.com' },
    } as unknown as Session;

    const mockViewerUser: User = {
      id: 'usr-viewer-1',
      firstname: 'Cliente',
      lastname: 'Externo',
      email: 'viewer@consultorio.com',
      role: 'viewer',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(authService.getSession).mockResolvedValueOnce(mockSession);
    vi.mocked(authService.getUserProfile).mockResolvedValueOnce(mockViewerUser);

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
    });

    expect(screen.getByTestId('user-role')).toHaveTextContent('viewer');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    expect(screen.getByTestId('is-viewer')).toHaveTextContent('true');
  });

  it('debe actualizar el estado al iniciar sesión correctamente con credenciales', async () => {
    vi.mocked(authService.getSession).mockResolvedValueOnce(null);

    const mockLoggedUser: User = {
      id: 'usr-admin-2',
      firstname: 'Admin',
      lastname: 'Demo',
      email: 'admin@consultorio.com',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockNewSession = {
      access_token: 'logged-in-token',
      user: { id: 'usr-admin-2', email: 'admin@consultorio.com' },
    } as unknown as Session;

    vi.mocked(authService.signIn).mockResolvedValueOnce({
      user: mockLoggedUser,
      session: mockNewSession,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Iniciar Sesión' }));
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
    expect(screen.getByTestId('user-email')).toHaveTextContent('admin@consultorio.com');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
  });

  it('debe limpiar el estado al ejecutar logout', async () => {
    const mockSession = {
      access_token: 'valid-token',
      user: { id: 'usr-1', email: 'test@consultorio.com' },
    } as unknown as Session;

    const mockUser: User = {
      id: 'usr-1',
      firstname: 'User',
      lastname: 'Test',
      email: 'test@consultorio.com',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    vi.mocked(authService.getSession).mockResolvedValueOnce(mockSession);
    vi.mocked(authService.getUserProfile).mockResolvedValueOnce(mockUser);
    vi.mocked(authService.signOut).mockResolvedValueOnce();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Autenticado');
    });

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Cerrar Sesión' }));
    });

    expect(authService.signOut).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('auth-status')).toHaveTextContent('No autenticado');
    expect(screen.getByTestId('user-email')).toHaveTextContent('Sin usuario');
    expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
  });

  it('debe invocar signInWithMicrosoft con los parámetros correctos', async () => {
    vi.mocked(authService.getSession).mockResolvedValueOnce(null);
    vi.mocked(authService.signInWithMicrosoft).mockResolvedValueOnce();

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId('loading-state')).not.toBeInTheDocument();
    });

    const user = userEvent.setup();
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Login con Microsoft' }));
    });

    expect(authService.signInWithMicrosoft).toHaveBeenCalledWith('/custom-redirect');
  });
});
