import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpenCheck,
  UserCog,
  CircleDollarSign,
  Building2,
  CalendarCheck,
  FileText,
  ShieldCheck,
  MessageSquare,
  User,
  LibraryBig,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import styles from '../styles/Sidebar.module.css';

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  // Role-specific navigation items
  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
          { section: 'Academic Structure' },
          { label: 'Academic Structure', path: '/admin/academic', icon: BookOpenCheck },
          { label: 'Students', path: '/admin/students', icon: Users },
          { label: 'Faculty', path: '/admin/faculty', icon: GraduationCap },
          { section: 'Finance & Services' },
          { label: 'Fee Management', path: '/admin/fees', icon: CircleDollarSign },
          { label: 'Staff & Facilities', path: '/admin/operations', icon: Building2 },
          { section: 'System Administration' },
          { label: 'User Accounts', path: '/admin/users', icon: UserCog },
        ];

      case 'FACULTY':
        return [
          { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
          { section: 'Classroom & Teaching' },
          { label: 'Class Attendance', path: '/faculty/attendance', icon: CalendarCheck },
          { label: 'Assignments', path: '/faculty/assignments', icon: FileText },
          { section: 'Facilities' },
          { label: 'Laboratory Equipment', path: '/faculty/lab', icon: ShieldCheck },
        ];

      case 'STUDENT':
        return [
          { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
          { section: 'Academic Records' },
          { label: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
          { label: 'Assignments', path: '/student/assignments', icon: FileText },
          { label: 'Fees & Invoices', path: '/student/fees', icon: CircleDollarSign },
          { label: 'Doubt Forum', path: '/student/forum', icon: MessageSquare },
          { section: 'Account' },
          { label: 'My Profile', path: '/student/profile', icon: User },
        ];

      case 'LIBRARIAN':
        return [
          { label: 'Dashboard', path: '/librarian/dashboard', icon: LayoutDashboard },
          { section: 'Circulation & Catalogue' },
          { label: 'Library & Issues', path: '/librarian/library', icon: LibraryBig },
        ];

      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      aria-label="Sidebar navigation"
    >
      <div className={styles.brand}>
        <Link to="/" className={styles.brandLink} onClick={onCloseMobile}>
          <div className={styles.brandLogo}>
            <GraduationCap size={22} />
          </div>
          {!collapsed && (
            <div className={styles.brandText}>
              <span className={styles.brandName}>College IMS</span>
              <span className={styles.brandSub}>Academic Portal</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item, index) => {
          if (item.section) {
            return !collapsed ? (
              <div key={`section-${index}`} className={styles.navSection}>
                {item.section}
              </div>
            ) : null;
          }

          const IconComponent = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.endsWith('/dashboard')}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={collapsed ? item.label : undefined}
              onClick={onCloseMobile}
            >
              <span className={styles.navIcon}>
                <IconComponent size={19} />
              </span>
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!collapsed && (
        <div className={styles.footer}>
          <div className={styles.systemBadge}>
            <span className={styles.statusDot} />
            <span>Institute Management</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            v1.2.0
          </span>
        </div>
      )}
    </aside>
  );
}
