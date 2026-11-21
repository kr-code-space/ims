import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { ROLE_DASHBOARDS } from '../../auth/navigation';
import styles from '../../styles/Error.module.css';

export function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    const role = (user?.role || 'ADMIN').toUpperCase();
    const destination = ROLE_DASHBOARDS[role] || '/login';
    navigate(destination, { replace: true });
  };

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
        onClick={handleReturn}
      >
        <ArrowLeft size={16} />
        Return to Dashboard
      </button>
    </div>
  );
}
