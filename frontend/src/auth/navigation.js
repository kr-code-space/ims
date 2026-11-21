/**
 * Role-aware route permission checking and safe destination resolution.
 */

export const ROLE_DASHBOARDS = {
  ADMIN: '/admin/dashboard',
  FACULTY: '/faculty/dashboard',
  STUDENT: '/student/dashboard',
  LIBRARIAN: '/librarian/dashboard',
};

/**
 * Determines whether a given route pathname is permitted for a user's role.
 *
 * @param {string} pathname The target destination path
 * @param {string} role The user's authenticated primary role (e.g. 'ADMIN', 'FACULTY', 'STUDENT', 'LIBRARIAN')
 * @returns {boolean} True if the role is authorized to access the route
 */
export function isRouteAllowedForRole(pathname, role) {
  if (!pathname || typeof pathname !== 'string') return false;

  const normalizedRole = (role || '').toUpperCase();
  const path = pathname.toLowerCase();

  // Exclude auth, error, and root pages from being valid intended post-login targets
  if (path === '/login' || path === '/forbidden' || path === '/' || path === '') {
    return false;
  }

  // Universal authenticated routes
  if (path === '/dashboard' || path === '/change-password') {
    return true;
  }

  // Admin routes: strictly ADMIN only
  if (path.startsWith('/admin')) {
    return normalizedRole === 'ADMIN';
  }

  // Faculty routes: FACULTY and ADMIN
  if (path.startsWith('/faculty')) {
    return normalizedRole === 'FACULTY' || normalizedRole === 'ADMIN';
  }

  // Student routes: STUDENT and ADMIN
  if (path.startsWith('/student')) {
    return normalizedRole === 'STUDENT' || normalizedRole === 'ADMIN';
  }

  // Librarian routes: LIBRARIAN and ADMIN
  if (path.startsWith('/librarian')) {
    return normalizedRole === 'LIBRARIAN' || normalizedRole === 'ADMIN';
  }

  return false;
}

/**
 * Resolves the correct post-login destination path.
 * If an intended destination exists AND the user's role is authorized to access it,
 * honors the intended destination. Otherwise, safely navigates to the role's default dashboard.
 *
 * @param {string|undefined} intendedPath The previously attempted path from location.state
 * @param {string} role The user's authenticated primary role
 * @returns {string} The safe destination path
 */
export function resolvePostLoginDestination(intendedPath, role) {
  const normalizedRole = (role || 'ADMIN').toUpperCase();
  const defaultDashboard = ROLE_DASHBOARDS[normalizedRole] || '/admin/dashboard';

  if (intendedPath && isRouteAllowedForRole(intendedPath, normalizedRole)) {
    return intendedPath;
  }

  return defaultDashboard;
}
