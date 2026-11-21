import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import styles from '../../styles/Error.module.css';

export function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={styles.errorContainer}>
      <div
        className={styles.iconCircle}
        style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)' }}
      >
        <ShieldAlert size={36} />
      </div>
      <div className={styles.code}>403</div>
      <h1 className={styles.title}>Access Forbidden</h1>
      <p className={styles.description}>
        Your current role (<strong>{user?.role || 'Guest'}</strong>) does not have
        permission to access this institutional resource. Please contact your Institute Administrator
        if you believe this is an error.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => navigate(`/${(user?.role || 'admin').toLowerCase()}`)}
      >
        <ArrowLeft size={16} />
        Return to Dashboard
      </button>
    </div>
  );
}
