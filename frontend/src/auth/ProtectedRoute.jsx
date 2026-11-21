import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-app)',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.9rem' }}>
          Loading Institute Management System...
        </span>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Only record destination if it is not login, forbidden, or root
    const isSpecialPath = ['/login', '/forbidden', '/'].includes(location.pathname);
    const redirectState = isSpecialPath ? undefined : { from: location };

    return <Navigate to="/login" state={redirectState} replace />;
  }

  return children;
}
