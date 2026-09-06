import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { CreateUserDTO, LoginDTO, User } from '../../../types/user';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDTO) => Promise<User>;
  register: (dto: CreateUserDTO) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
