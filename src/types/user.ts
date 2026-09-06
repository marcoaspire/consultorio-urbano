/**
 * Modelo de datos para la entidad de Usuarios (Autenticación / Perfiles).
 * Conforme a PostgreSQL Supabase con soporte para Soft Delete.
 * Las contraseñas son gestionadas de forma segura y nativa por Supabase Auth (auth.users).
 */

export interface User {
  id: string; // UUID de Supabase Auth
  firstname: string;
  lastname: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateUserDTO {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
