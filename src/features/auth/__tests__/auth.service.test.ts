import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../../services/auth.service';
import { supabase } from '../../../lib/supabase';
import { AuthError, type Session, type User as SupabaseAuthUser } from '@supabase/supabase-js';

vi.mock('../../../lib/supabase', () => {
  const fromMock = vi.fn();
  return {
    supabase: {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
      from: fromMock,
    },
  };
});

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signIn', () => {
    it('debe iniciar sesión con credenciales y recuperar el perfil del usuario con su rol', async () => {
      const mockSession = { access_token: 'fake-token' } as Session;
      const mockAuthUser = {
        id: 'usr-123',
        email: 'admin@consultorio.com',
        user_metadata: { firstname: 'Admin', lastname: 'User' },
      } as unknown as SupabaseAuthUser;

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: mockAuthUser, session: mockSession },
        error: null,
      });

      const maybeSingleMock = vi.fn().mockResolvedValueOnce({
        data: {
          id: 'usr-123',
          email: 'admin@consultorio.com',
          firstname: 'Admin',
          lastname: 'User',
          role: 'admin',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null,
      });

      const isMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqMock = vi.fn().mockReturnValue({ is: isMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<typeof supabase.from>);

      const result = await authService.signIn({
        email: 'admin@consultorio.com',
        password: 'password123',
      });

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'admin@consultorio.com',
        password: 'password123',
      });
      expect(result.user.role).toBe('admin');
      expect(result.session).toBe(mockSession);
    });

    it('debe arrojar error cuando las credenciales son inválidas', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new AuthError('Invalid login credentials', 400),
      });

      await expect(
        authService.signIn({
          email: 'wrong@consultorio.com',
          password: 'bad-password',
        })
      ).rejects.toThrow('Invalid login credentials');
    });
  });

  describe('signInWithMicrosoft', () => {
    it('debe iniciar el flujo OAuth con el proveedor azure y scopes correctos', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
        data: { provider: 'azure', url: 'https://login.microsoftonline.com' },
        error: null,
      });

      await authService.signInWithMicrosoft('http://localhost:3000/');

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'azure',
        options: {
          scopes: 'email profile openid',
          redirectTo: 'http://localhost:3000/',
        },
      });
    });

    it('debe arrojar un error si el proveedor OAuth responde con fallo', async () => {
      vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValueOnce({
        data: { provider: 'azure', url: null },
        error: new AuthError('OAuth Provider Error', 500),
      });

      await expect(authService.signInWithMicrosoft()).rejects.toThrow('OAuth Provider Error');
    });
  });

  describe('signOut', () => {
    it('debe invocar supabase.auth.signOut correctamente', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({ error: null });

      await authService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('debe arrojar error si signOut falla', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
        error: new AuthError('Network error on signout', 500),
      });

      await expect(authService.signOut()).rejects.toThrow('Network error on signout');
    });
  });

  describe('getUserProfile', () => {
    it('debe retornar rol viewer por defecto si la base de datos no tiene rol definido', async () => {
      const mockAuthUser = {
        id: 'usr-viewer',
        email: 'viewer@consultorio.com',
      } as unknown as SupabaseAuthUser;

      const maybeSingleMock = vi.fn().mockResolvedValueOnce({
        data: {
          id: 'usr-viewer',
          email: 'viewer@consultorio.com',
          firstname: 'Juan',
          lastname: 'López',
          role: null,
        },
        error: null,
      });

      const isMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock });
      const eqMock = vi.fn().mockReturnValue({ is: isMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      vi.mocked(supabase.from).mockReturnValue({ select: selectMock } as unknown as ReturnType<typeof supabase.from>);

      const profile = await authService.getUserProfile('usr-viewer', mockAuthUser);

      expect(profile.role).toBe('viewer');
      expect(profile.firstname).toBe('Juan');
    });
  });
});
