import React from 'react';
import styles from '../styles/StatCard.module.css';

export function StatCard({ label, value, subtext, icon: Icon, color = 'primary' }) {
  const getColorStyles = (c) => {
    switch (c) {
      case 'success':
        return { bg: 'var(--success-bg)', color: 'var(--success)' };
      case 'warning':
        return { bg: 'var(--warning-bg)', color: 'var(--warning)' };
      case 'danger':
        return { bg: 'var(--danger-bg)', color: 'var(--danger)' };
      case 'info':
        return { bg: 'var(--info-bg)', color: 'var(--info)' };
      case 'primary':
      default:
        return { bg: 'var(--primary-light)', color: 'var(--primary)' };
    }
  };

  const colorStyle = getColorStyles(color);

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        {subtext && <span className={styles.subtext}>{subtext}</span>}
      </div>
      {Icon && (
        <div
          className={styles.iconWrapper}
          style={{ backgroundColor: colorStyle.bg, color: colorStyle.color }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
