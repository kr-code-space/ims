import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Sun,
  Moon,
  ChevronDown,
  KeyRound,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { useTheme } from '../hooks/useTheme';
import styles from '../styles/Topbar.module.css';

export function Topbar({ onToggleMobile }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login', { replace: true, state: null });
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-primary';
      case 'FACULTY':
        return 'badge-success';
      case 'STUDENT':
        return 'badge-warning';
      case 'LIBRARIAN':
        return 'badge-primary';
      default:
        return 'badge-primary';
    }
  };

  const initial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <header className={styles.topbar}>
      <div className={styles.leftSection}>
        <button
          type="button"
          className={styles.menuToggle}
          onClick={onToggleMobile}
          aria-label="Toggle navigation drawer"
        >
          <Menu size={20} />
        </button>

        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search records, students, courses... (Ctrl+K)"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.themeBtn}
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className={styles.userMenu} ref={dropdownRef}>
          <div
            className={styles.userTrigger}
            onClick={() => setDropdownOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            <div className={styles.avatar}>{initial}</div>
            <div className={styles.userInfo}>
              <span className={styles.username}>{user?.username || 'User'}</span>
              <span className={styles.roleTag}>{user?.role || 'Guest'}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </div>

          {dropdownOpen && (
            <div className={styles.dropdown} role="menu">
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownUser}>{user?.username}</div>
                <div className={styles.dropdownRole}>
                  <span className={`badge ${getRoleBadgeClass(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={styles.dropdownItem}
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/change-password');
                }}
                role="menuitem"
              >
                <KeyRound size={15} />
                <span>Change Password</span>
              </button>

              <div className={styles.dropdownDivider} />

              <button
                type="button"
                className={`${styles.dropdownItem} ${styles.danger}`}
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
