import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import styles from '../../styles/Error.module.css';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={styles.errorContainer}>
      <div
        className={styles.iconCircle}
        style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}
      >
        <Compass size={36} />
      </div>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.description}>
        The requested URL or module does not exist on this Institute Management System instance.
      </p>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => navigate(`/${(user?.role || 'admin').toLowerCase()}`)}
      >
        <Home size={16} />
        Return to Dashboard
      </button>
    </div>
  );
}
