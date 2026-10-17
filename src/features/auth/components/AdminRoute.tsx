import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children, redirectTo = '/' }) => {
  return (
    <ProtectedRoute requireAdmin redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  );
};
