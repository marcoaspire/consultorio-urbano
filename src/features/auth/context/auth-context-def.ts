import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { CreateUserDTO, LoginDTO, User, UserRole } from '../../../types/user';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  isAdmin: boolean;
  isViewer: boolean;
  login: (dto: LoginDTO) => Promise<User>;
  loginWithMicrosoft: (redirectTo?: string) => Promise<void>;
  register: (dto: CreateUserDTO) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
