import React from 'react';
import styles from '../styles/PageHeader.module.css';

export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className={styles.header}>
      <div className={styles.textGroup}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
