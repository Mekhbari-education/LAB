import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useUserRole } from '../context/UserRoleContext';
import { useSystemConfig } from '../context/SystemConfigContext';
import { ROUTES } from '../config/routes';
import { auth, isProjectOwner } from '../firebase';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route protection wrapper enforcing:
 * 1) Owner-exclusive access for /admin
 * 2) Dynamic RBAC matrix + global feature flags from SystemConfigContext
 */
export default function RoleProtectedRoute({ children }: RoleProtectedRouteProps) {
  const { currentRole, roleConfig } = useUserRole();
  const { isRouteEffectivelyAllowed } = useSystemConfig();
  const location = useLocation();
  const [authUser, setAuthUser] = useState<any>(() => auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return () => unsub();
  }, []);

  const isOwner = isProjectOwner(authUser || auth.currentUser);
  const isAllowed = isRouteEffectivelyAllowed(currentRole, location.pathname, isOwner);

  if (!isAllowed) {
    const fallbackPath = roleConfig?.defaultPath || ROUTES.HOME;
    if (fallbackPath !== location.pathname) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
}
