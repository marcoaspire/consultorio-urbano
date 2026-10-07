/**
 * Modelo de datos para la entidad de Usuarios (Autenticación / Perfiles).
 * Conforme a PostgreSQL nativo con soporte para Soft Delete y JWT.
 */

export interface User {
  id: string; // UUID
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

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface AuthResponse {
  user: User;
  session: {
    accessToken: string;
    refreshToken: string;
  };
}
