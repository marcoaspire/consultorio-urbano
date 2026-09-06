import React, { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { authService } from '../../../services/auth.service';
import type { CreateUserDTO, LoginDTO, User } from '../../../types/user';
import { AuthContext } from './auth-context-def';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carga del perfil de usuario a partir de la sesión activa
  const loadProfile = useCallback(async (currentSession: Session | null) => {
    if (currentSession?.user) {
      try {
        const profile = await authService.getUserProfile(
          currentSession.user.id,
          currentSession.user
        );
        setUser(profile);
      } catch (err) {
        console.error('Error al cargar perfil de usuario:', err);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Obtener la sesión existente al montar
    authService.getSession().then((initialSession) => {
      if (!isMounted) return;
      setSession(initialSession);
      loadProfile(initialSession).finally(() => {
        if (isMounted) setIsLoading(false);
      });
    });

    // 2. Suscribirse a cambios en el estado de autenticación de Supabase (login, logout, refresh)
    const subscription = authService.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      await loadProfile(newSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = async (dto: LoginDTO): Promise<User> => {
    setIsLoading(true);
    try {
      const { user: loggedUser, session: newSession } = await authService.signIn(dto);
      setUser(loggedUser);
      setSession(newSession);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: CreateUserDTO): Promise<User> => {
    setIsLoading(true);
    try {
      const { user: newUser, session: newSession } = await authService.signUp(dto);
      setUser(newUser);
      setSession(newSession);
      return newUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (session?.user) {
      await loadProfile(session);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: Boolean(user && session),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
