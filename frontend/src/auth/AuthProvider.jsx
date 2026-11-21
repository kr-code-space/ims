import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const VALID_ROLES = ['ADMIN', 'FACULTY', 'STUDENT', 'LIBRARIAN'];

const roleFromToken = (value) => value?.replace(/^ROLE_/, '').toUpperCase();

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem('ims_auth_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Build Axios client based on active session credentials
  const apiClient = useMemo(() => {
    return axios.create({
      baseURL: BASE_URL,
      auth: session?.username && session?.password ? {
        username: session.username,
        password: session.password,
      } : undefined,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }, [session?.username, session?.password]);

  // Verify authentication on mount if session exists
  useEffect(() => {
    if (!session?.username || !session?.password) {
      setLoading(false);
      return;
    }

    let isCurrent = true;
    apiClient.get('/auth/me')
      .then((res) => {
        if (!isCurrent) return;
        const roleTokens = Array.isArray(res.data.roles) ? res.data.roles : session.roleTokens || [];
        const primaryRole = roleTokens
          .map(roleFromToken)
          .find((r) => VALID_ROLES.includes(r)) || session.primaryRole || 'STUDENT';

        const updated = {
          ...session,
          primaryRole,
          roleTokens,
        };
        setSession(updated);
        try {
          localStorage.setItem('ims_auth_session', JSON.stringify(updated));
        } catch {
          // ignore storage error
        }
      })
      .catch((err) => {
        // If 401 Unauthorized, clear invalid session
        if (err.response?.status === 401) {
          localStorage.removeItem('ims_auth_session');
          setSession(null);
        }
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []); // Run on initial mount

  const login = useCallback(async ({ username, password }) => {
    const tempClient = axios.create({
      baseURL: BASE_URL,
      auth: { username, password },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    try {
      const response = await tempClient.post('/auth/login', { username, password });
      const roleTokens = Array.isArray(response.data.roles) ? response.data.roles : [];
      const primaryRole = roleTokens
        .map(roleFromToken)
        .find((r) => VALID_ROLES.includes(r)) || 'STUDENT';

      const nextSession = {
        username,
        password, // stored for HTTP basic auth in local SPA session
        primaryRole,
        roleTokens,
      };

      setSession(nextSession);
      try {
        localStorage.setItem('ims_auth_session', JSON.stringify(nextSession));
      } catch {
        // ignore storage error
      }

      return {
        ...nextSession,
        role: primaryRole,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Incorrect username or password.');
      }
      if (error.response) {
        throw new Error(error.response.data?.message || `Login failed (HTTP ${error.response.status}).`);
      }
      throw new Error('Unable to connect to the IMS backend. Make sure the Spring Boot server is running.');
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('ims_auth_session');
    } catch {
      // ignore
    }
    setSession(null);
  }, []);

  const changePassword = useCallback(async ({ currentPassword, newPassword }) => {
    if (!apiClient) throw new Error('Not authenticated');
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });

    // Update password in local session credentials so subsequent calls continue to authenticate
    if (session) {
      const updated = { ...session, password: newPassword };
      setSession(updated);
      try {
        localStorage.setItem('ims_auth_session', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }

    return response.data;
  }, [apiClient, session]);

  const user = useMemo(() => {
    if (!session) return null;
    return {
      username: session.username,
      primaryRole: session.primaryRole,
      role: session.primaryRole,
      roleTokens: session.roleTokens || [],
      roles: session.roleTokens || [],
    };
  }, [session]);

  const contextValue = useMemo(() => ({
    user,
    session,
    apiClient,
    loading,
    isAuthenticated: !!session,
    login,
    logout,
    changePassword,
  }), [user, session, apiClient, loading, login, logout, changePassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
