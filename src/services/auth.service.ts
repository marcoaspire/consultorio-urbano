import { supabase } from '../lib/supabase';
import type { CreateUserDTO, LoginDTO, User } from '../types/user';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';

export const authService = {
  /**
   * Registra un nuevo usuario en Supabase Auth y sincroniza su perfil en public.users
   */
  async signUp(dto: CreateUserDTO): Promise<{ user: User; session: Session | null }> {
    const { firstname, lastname, email, password } = dto;

    // 1. Registro nativo en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          firstname: firstname.trim(),
          lastname: lastname.trim(),
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario en Supabase Auth.');
    }

    // 2. Sincronización del perfil en public.users vinculando el id devuelto por Auth
    const now = new Date().toISOString();
    const newProfile = {
      id: authData.user.id,
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      email: email.trim(),
      updated_at: now,
    };

    const { data: insertedProfile, error: profileError } = await supabase
      .from('users')
      .upsert(newProfile)
      .select('*')
      .single();

    if (profileError) {
      console.warn('Advertencia al sincronizar perfil en public.users:', profileError.message);
    }

    const userResult: User = insertedProfile || {
      ...newProfile,
      created_at: now,
      deleted_at: null,
    };

    // Si Supabase no devolvió la sesión directamente en el signUp, iniciar sesión automáticamente
    let activeSession = authData.session;
    if (!activeSession) {
      try {
        const { data: signInData } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        activeSession = signInData.session;
      } catch {
        // Continuar
      }
    }

    return {
      user: userResult,
      session: activeSession,
    };
  },

  /**
   * Inicia sesión con correo y contraseña en Supabase Auth y recupera el perfil de public.users
   */
  async signIn(dto: LoginDTO): Promise<{ user: User; session: Session }> {
    const { email, password } = dto;

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user || !authData.session) {
      throw new Error('Credenciales inválidas o sesión no disponible.');
    }

    // Obtener perfil desde public.users
    const profile = await this.getUserProfile(authData.user.id, authData.user);

    return {
      user: profile,
      session: authData.session,
    };
  },

  /**
   * Cierra la sesión activa en Supabase
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  /**
   * Obtiene la sesión actual desde Supabase Auth
   */
  async getSession(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error al obtener la sesión:', error.message);
      return null;
    }
    return data.session;
  },

  /**
   * Obtiene el perfil de un usuario desde public.users (respetando soft delete)
   * Si no existe en la tabla, genera un perfil base usando la metadata de Auth
   */
  async getUserProfile(userId: string, authUser?: SupabaseAuthUser): Promise<User> {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (profile && !error) {
      return profile as User;
    }

    // Fallback con metadata de Supabase Auth
    const metadata = authUser?.user_metadata || {};
    const fallbackUser: User = {
      id: userId,
      firstname: metadata.firstname || authUser?.email?.split('@')[0] || 'Usuario',
      lastname: metadata.lastname || '',
      email: authUser?.email || '',
      created_at: authUser?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    // Intentar auto-sincronizar el perfil
    try {
      await supabase.from('users').upsert({
        id: fallbackUser.id,
        firstname: fallbackUser.firstname,
        lastname: fallbackUser.lastname,
        email: fallbackUser.email,
        updated_at: new Date().toISOString(),
      });
    } catch {
      // Continuar con el fallback en memoria
    }

    return fallbackUser;
  },

  /**
   * Suscribe un listener a cambios en el estado de autenticación (login, logout, refresh de token)
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
  },
};
