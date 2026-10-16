import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '../context/UserRoleContext';
import { isRouteAllowedForRole } from '../config/permissions';
import { ROUTES } from '../config/routes';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route protection wrapper enforcing:
 * "تقييد كامل: إخفاء تام لأي صفحة أو بطاقة خارج اختصاص الرتبة"
 */
export default function RoleProtectedRoute({ children }: RoleProtectedRouteProps) {
  const { currentRole, roleConfig } = useUserRole();
  const location = useLocation();

  const isAllowed = isRouteAllowedForRole(currentRole, location.pathname);

  if (!isAllowed) {
    const fallbackPath = roleConfig?.defaultPath || ROUTES.HOME;
    // Prevent redirect loops
    if (fallbackPath !== location.pathname) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}
