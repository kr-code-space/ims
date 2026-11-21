import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import styles from '../styles/AppLayout.module.css';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
          role="presentation"
        />
      )}

      <div className={`${styles.mainContent} ${collapsed ? styles.expanded : ''}`}>
        <Topbar onToggleMobile={() => setMobileOpen((prev) => !prev)} />
        <main className={styles.contentWrapper}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
