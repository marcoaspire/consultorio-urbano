import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  redirectTo = '/',
}) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#051424] text-[#d4e4fa] flex flex-col items-center justify-center font-['Inter']">
        <div className="w-10 h-10 rounded-xl bg-[#1c2b3c] border border-[#7bd0ff]/40 flex items-center justify-center text-[#7bd0ff] mb-3 shadow-lg shadow-[#7bd0ff]/20 animate-pulse">
          <span className="material-symbols-outlined text-[24px]">explore</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#c6c6cd]">
          <span className="inline-block w-3.5 h-3.5 border-2 border-[#7bd0ff]/40 border-t-[#7bd0ff] rounded-full animate-spin" />
          <span>Verificando permisos y sesión...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};
