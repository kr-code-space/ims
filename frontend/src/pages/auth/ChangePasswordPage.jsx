import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import styles from '../../styles/Auth.module.css';

export function ChangePasswordPage() {
  const { changePassword, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.currentPassword) {
      setError('Current password is required.');
      return;
    }

    if (!form.newPassword || form.newPassword.length < 12 || form.newPassword.length > 72) {
      setError('New password must be between 12 and 72 characters.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      showToast('Password updated successfully!', 'success');
      navigate(-1);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update password.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer} style={{ minHeight: 'auto', padding: '30px 0' }}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.logo} style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <KeyRound size={26} />
          </div>
          <h1 className={styles.title}>Change Password</h1>
          <p className={styles.subtitle}>
            Update account security credentials for <strong>{user?.username}</strong>
          </p>
        </div>

        {error && (
          <div className={`${styles.alertBox} ${styles.alertError}`} role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword" className={styles.label}>
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              placeholder="••••••••••••"
              value={form.currentPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.label}>
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="12–72 characters"
              value={form.newPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="••••••••••••"
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              style={{ flex: 1 }}
            >
              <ArrowLeft size={16} />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Update</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
