import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { RoleRoute } from './auth/RoleRoute';
import { useAuth } from './auth/useAuth';
import { ROLE_DASHBOARDS } from './auth/navigation';
import { ToastProvider } from './components/ToastProvider';
import { AppLayout } from './components/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ChangePasswordPage } from './pages/auth/ChangePasswordPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ForbiddenPage } from './pages/errors/ForbiddenPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';

// Admin Features
import StudentManagement from './features/admin/StudentManagement';
import FacultyManagement from './features/admin/FacultyManagement';
import AcademicManagement from './features/admin/AcademicManagement';
import UserManagement from './features/admin/UserManagement';
import AdminFees from './features/admin/AdminFees';
import AdminOperations from './features/admin/AdminOperations';

// Faculty Features
import FacultyAttendance from './features/faculty/FacultyAttendance';
import FacultyAssignments from './features/faculty/FacultyAssignments';
import FacultyLab from './features/faculty/FacultyLab';

// Student Features
import StudentAttendance from './features/student/StudentAttendance';
import StudentAssignments from './features/student/StudentAssignments';
import StudentFees from './features/student/StudentFees';
import StudentProfile from './features/student/StudentProfile';
import StudentForum from './features/student/StudentForum';

// Librarian Features
import LibrarianLibrary from './features/librarian/LibrarianLibrary';

function RootRedirect() {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const role = (user?.role || 'ADMIN').toUpperCase();
  const dashboardPath = ROLE_DASHBOARDS[role] || '/admin/dashboard';
  return <Navigate to={dashboardPath} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Entry Points */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forbidden" element={<ForbiddenPage />} />

            {/* Authenticated Application Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* Universal User Routes */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/change-password" element={<ChangePasswordPage />} />

              {/* Admin Portal Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route
                path="/admin/dashboard"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <DashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/academic"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AcademicManagement />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <StudentManagement />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/faculty"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <FacultyManagement />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/fees"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminFees />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/operations"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminOperations />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </RoleRoute>
                }
              />

              {/* Faculty Portal Routes */}
              <Route path="/faculty" element={<Navigate to="/faculty/dashboard" replace />} />
              <Route
                path="/faculty/dashboard"
                element={
                  <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                    <DashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/faculty/attendance"
                element={
                  <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                    <FacultyAttendance />
                  </RoleRoute>
                }
              />
              <Route
                path="/faculty/assignments"
                element={
                  <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                    <FacultyAssignments />
                  </RoleRoute>
                }
              />
              <Route
                path="/faculty/lab"
                element={
                  <RoleRoute allowedRoles={['FACULTY', 'ADMIN']}>
                    <FacultyLab />
                  </RoleRoute>
                }
              />

              {/* Student Portal Routes */}
              <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
              <Route
                path="/student/dashboard"
                element={
                  <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                    <DashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentAttendance />
                  </RoleRoute>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentAssignments />
                  </RoleRoute>
                }
              />
              <Route
                path="/student/fees"
                element={
                  <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentFees />
                  </RoleRoute>
                }
              />
              <Route
                path="/student/forum"
                element={
                  <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentForum />
                  </RoleRoute>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <RoleRoute allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentProfile />
                  </RoleRoute>
                }
              />

              {/* Librarian Portal Routes */}
              <Route path="/librarian" element={<Navigate to="/librarian/dashboard" replace />} />
              <Route
                path="/librarian/dashboard"
                element={
                  <RoleRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                    <DashboardPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/librarian/library"
                element={
                  <RoleRoute allowedRoles={['LIBRARIAN', 'ADMIN']}>
                    <LibrarianLibrary />
                  </RoleRoute>
                }
              />

              {/* Catch-all route inside shell */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Global fallback route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
