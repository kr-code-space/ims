import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function RoleRoute({ allowedRoles, children }) {
  const { user, loading, isAuthenticated } = useAuth();

  // If authentication state is still resolving, render nothing to avoid flashing 403
  if (loading || (isAuthenticated && !user)) {
    return null;
  }

  // If unauthenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but unauthorized for this route, redirect to forbidden
  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
