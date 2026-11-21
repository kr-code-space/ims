import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { resolvePostLoginDestination } from '../../auth/navigation';
import { useToast } from '../../components/useToast';
import styles from '../../styles/Auth.module.css';

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname;

  if (isAuthenticated && user) {
    const destination = resolvePostLoginDestination(from, user.role);
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const session = await login(form);
      showToast(`Welcome back, ${session.username}!`, 'success');
      const role = session.primaryRole || session.role || 'ADMIN';
      const destination = resolvePostLoginDestination(from, role);
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.message || 'Unable to sign in. Please verify your credentials.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickRole = (username, password) => {
    setForm({ username, password });
    setError('');
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <GraduationCap size={28} />
          </div>
          <h1 className={styles.title}>College Management</h1>
          <p className={styles.subtitle}>Sign in to your institutional account</p>
        </div>

        {error && (
          <div className={`${styles.alertBox} ${styles.alertError}`} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="e.g. admin, faculty_user, student_id"
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '6px' }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <div className={styles.quickRoles}>
          <div className={styles.quickRolesTitle}>Quick Fill Roles (Demo Accounts)</div>
          <div className={styles.roleButtons}>
            <button
              type="button"
              className={styles.roleBtn}
              onClick={() => fillQuickRole('admin', 'PritamMahato1234')}
            >
              Admin
            </button>
            <button
              type="button"
              className={styles.roleBtn}
              onClick={() => fillQuickRole('faculty', 'Faculty123456')}
            >
              Faculty
            </button>
            <button
              type="button"
              className={styles.roleBtn}
              onClick={() => fillQuickRole('student', 'Student123456')}
            >
              Student
            </button>
            <button
              type="button"
              className={styles.roleBtn}
              onClick={() => fillQuickRole('librarian', 'Librarian1234')}
            >
              Librarian
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
