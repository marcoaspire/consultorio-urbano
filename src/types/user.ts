/**
 * Modelo de datos para la entidad de Usuarios (Autenticación / Perfiles).
 * Conforme a PostgreSQL Supabase con soporte para Soft Delete.
 */

export interface User {
  id: string; // UUID
  firstname: string;
  lastname: string;
  email: string;
  password?: string; // Excluido típicamente en respuestas públicas
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
