import { api, tokenStorage } from './api';
import type { CreateUserDTO, LoginDTO, User, AuthSession } from '../types/user';

type AuthListener = (event: string, session: AuthSession | null) => void;
const authListeners: Set<AuthListener> = new Set();

function notifyAuthChange(event: string, session: AuthSession | null) {
  authListeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (err) {
      console.error('Error notifying auth listener:', err);
    }
  });
}

export const authService = {
  /**
   * Registra un nuevo usuario en la API nativa y guarda tokens JWT
   */
  async signUp(dto: CreateUserDTO): Promise<{ user: User; session: AuthSession | null }> {
    const data = await api.post<{
      user: User;
      session: { accessToken: string; refreshToken: string };
    }>('/auth/register', dto);

    tokenStorage.setTokens(data.session.accessToken, data.session.refreshToken);

    const session: AuthSession = {
      accessToken: data.session.accessToken,
      refreshToken: data.session.refreshToken,
      user: data.user,
    };

    notifyAuthChange('SIGNED_IN', session);
    return { user: data.user, session };
  },

  /**
   * Inicia sesión con correo y contraseña vía JWT en la API REST
   */
  async signIn(dto: LoginDTO): Promise<{ user: User; session: AuthSession }> {
    const data = await api.post<{
      user: User;
      session: { accessToken: string; refreshToken: string };
    }>('/auth/login', dto);

    tokenStorage.setTokens(data.session.accessToken, data.session.refreshToken);

    const session: AuthSession = {
      accessToken: data.session.accessToken,
      refreshToken: data.session.refreshToken,
      user: data.user,
    };

    notifyAuthChange('SIGNED_IN', session);
    return { user: data.user, session };
  },

  /**
   * Cierra la sesión activa revocando tokens e informando a los suscriptores
   */
  async signOut(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignorar fallos de red al cerrar sesión
    } finally {
      tokenStorage.clearTokens();
      notifyAuthChange('SIGNED_OUT', null);
    }
  },

  /**
   * Obtiene la sesión actual a partir del token JWT almacenado y valida su vigencia con /auth/me
   */
  async getSession(): Promise<AuthSession | null> {
    const accessToken = tokenStorage.getAccessToken();
    if (!accessToken) return null;

    try {
      const data = await api.get<{ user: User }>('/auth/me');
      return {
        accessToken,
        refreshToken: tokenStorage.getRefreshToken() || undefined,
        user: data.user,
      };
    } catch {
      tokenStorage.clearTokens();
      return null;
    }
  },

  /**
   * Obtiene el perfil de un usuario desde la API REST
   */
  async getUserProfile(userId?: string): Promise<User> {
    if (!userId) {
      const data = await api.get<{ user: User }>('/auth/me');
      return data.user;
    }
    const data = await api.get<{ user: User }>('/auth/me');
    return data.user;
  },

  /**
   * Suscribe un listener a cambios en el estado de autenticación (login, logout, expiración)
   */
  onAuthStateChange(callback: AuthListener) {
    authListeners.add(callback);
    return {
      unsubscribe: () => {
        authListeners.delete(callback);
      },
    };
  },
};
