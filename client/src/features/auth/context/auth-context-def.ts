import { createContext } from 'react';
import type { CreateUserDTO, LoginDTO, User, AuthSession } from '../../../types/user';

export interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDTO) => Promise<User>;
  register: (dto: CreateUserDTO) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
