import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}
