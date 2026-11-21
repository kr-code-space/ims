import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpenCheck,
  UserCog,
  CircleDollarSign,
  Building2,
  CalendarCheck,
  FileText,
  ShieldCheck,
  LibraryBig,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import styles from '../../styles/Dashboard.module.css';

export function DashboardPage() {
  const { user, apiClient } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'STUDENT';

  const [metrics, setMetrics] = useState({
    studentsCount: 0,
    facultyCount: 0,
    usersCount: 0,
    academicClasses: 0,
    departmentsCount: 0,
    feesCount: 0,
    // Faculty metrics
    offeringsCount: 0,
    assignmentsCount: 0,
    labEquipmentCount: 0,
    // Student metrics
    attendancePercent: 0,
    studentAssignmentsCount: 0,
    studentFeesDue: 0,
    // Librarian metrics
    booksCount: 0,
    issuesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function fetchDashboardData() {
      setLoading(true);
      try {
        if (role === 'ADMIN') {
          const [studentsRes, facultyRes, usersRes, academicRes, feesRes] = await Promise.allSettled([
            apiClient.get('/admin/students'),
            apiClient.get('/admin/faculty'),
            apiClient.get('/admin/users'),
            apiClient.get('/admin/academic'),
            apiClient.get('/admin/fees'),
          ]);

          if (!isCurrent) return;
          setMetrics((prev) => ({
            ...prev,
            studentsCount: studentsRes.status === 'fulfilled' ? studentsRes.value.data.length : 0,
            facultyCount: facultyRes.status === 'fulfilled' ? facultyRes.value.data.length : 0,
            usersCount: usersRes.status === 'fulfilled' ? usersRes.value.data.length : 0,
            departmentsCount: academicRes.status === 'fulfilled' ? academicRes.value.data?.departments?.length || 0 : 0,
            academicClasses: academicRes.status === 'fulfilled' ? academicRes.value.data?.classes?.length || 0 : 0,
            feesCount: feesRes.status === 'fulfilled' ? feesRes.value.data.length : 0,
          }));
        } else if (role === 'FACULTY') {
          const [offeringsRes, assignmentsRes, labRes] = await Promise.allSettled([
            apiClient.get('/faculty/attendance/offerings'),
            apiClient.get('/faculty/assignments'),
            apiClient.get('/faculty/lab-access'),
          ]);

          if (!isCurrent) return;
          setMetrics((prev) => ({
            ...prev,
            offeringsCount: offeringsRes.status === 'fulfilled' ? offeringsRes.value.data.length : 0,
            assignmentsCount: assignmentsRes.status === 'fulfilled' ? assignmentsRes.value.data.length : 0,
            labEquipmentCount: labRes.status === 'fulfilled' ? labRes.value.data.length : 0,
          }));
        } else if (role === 'STUDENT') {
          const [attendanceRes, assignmentsRes, feesRes] = await Promise.allSettled([
            apiClient.get('/student/attendance'),
            apiClient.get('/student/assignments'),
            apiClient.get('/student/fees'),
          ]);

          if (!isCurrent) return;
          let calculatedAttendance = 0;
          if (attendanceRes.status === 'fulfilled' && attendanceRes.value.data.length > 0) {
            const records = attendanceRes.value.data;
            const presentCount = records.filter((r) => r.present).length;
            calculatedAttendance = Math.round((presentCount / records.length) * 100);
          }

          let pendingDues = 0;
          if (feesRes.status === 'fulfilled') {
            pendingDues = feesRes.value.data
              .filter((f) => f.status !== 'PAID')
              .reduce((sum, f) => sum + (Number(f.amount || 0) - Number(f.paidAmount || 0)), 0);
          }

          setMetrics((prev) => ({
            ...prev,
            attendancePercent: calculatedAttendance,
            studentAssignmentsCount: assignmentsRes.status === 'fulfilled' ? assignmentsRes.value.data.length : 0,
            studentFeesDue: pendingDues,
          }));
        } else if (role === 'LIBRARIAN') {
          const [booksRes, issuesRes] = await Promise.allSettled([
            apiClient.get('/librarian/books'),
            apiClient.get('/librarian/issues'),
          ]);

          if (!isCurrent) return;
          setMetrics((prev) => ({
            ...prev,
            booksCount: booksRes.status === 'fulfilled' ? booksRes.value.data.length : 0,
            issuesCount: issuesRes.status === 'fulfilled' ? issuesRes.value.data.length : 0,
          }));
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    fetchDashboardData();

    return () => {
      isCurrent = false;
    };
  }, [apiClient, role]);

  const getRoleConfig = () => {
    switch (role) {
      case 'ADMIN':
        return {
          title: 'Administrative Control Center',
          subtitle: 'Institutional records, academic structure, student accounts, and operational oversight.',
          kpis: [
            { label: 'Active Students', value: loading ? '...' : metrics.studentsCount, icon: Users, bg: 'var(--primary-light)', color: 'var(--primary)' },
            { label: 'Faculty Members', value: loading ? '...' : metrics.facultyCount, icon: GraduationCap, bg: 'var(--info-bg)', color: 'var(--info)' },
            { label: 'Academic Classes', value: loading ? '...' : metrics.academicClasses, icon: BookOpenCheck, bg: 'var(--success-bg)', color: 'var(--success)' },
            { label: 'System Accounts', value: loading ? '...' : metrics.usersCount, icon: UserCog, bg: 'var(--warning-bg)', color: 'var(--warning)' },
          ],
          actions: [
            { label: 'Manage Student Records', icon: Users, path: '/admin/students' },
            { label: 'Academic Structure & Offerings', icon: BookOpenCheck, path: '/admin/academic' },
            { label: 'Faculty Allocations', icon: GraduationCap, path: '/admin/faculty' },
            { label: 'Fee Records & Invoicing', icon: CircleDollarSign, path: '/admin/fees' },
            { label: 'Staff & Facilities Overview', icon: Building2, path: '/admin/operations' },
          ],
        };

      case 'FACULTY':
        return {
          title: 'Faculty Teaching Portal',
          subtitle: 'Assigned classroom offerings, attendance marking registers, and student assignment evaluations.',
          kpis: [
            { label: 'Assigned Offerings', value: loading ? '...' : metrics.offeringsCount, icon: BookOpenCheck, bg: 'var(--primary-light)', color: 'var(--primary)' },
            { label: 'Active Assignments', value: loading ? '...' : metrics.assignmentsCount, icon: FileText, bg: 'var(--info-bg)', color: 'var(--info)' },
            { label: 'Lab Equipment', value: loading ? '...' : metrics.labEquipmentCount, icon: ShieldCheck, bg: 'var(--success-bg)', color: 'var(--success)' },
            { label: 'Portal Status', value: 'Active', icon: Sparkles, bg: 'var(--warning-bg)', color: 'var(--warning)' },
          ],
          actions: [
            { label: 'Mark Class Attendance', icon: CalendarCheck, path: '/faculty/attendance' },
            { label: 'Create & Grade Assignments', icon: FileText, path: '/faculty/assignments' },
            { label: 'Laboratory Equipment Status', icon: ShieldCheck, path: '/faculty/lab' },
          ],
        };

      case 'STUDENT':
        return {
          title: 'Student Academic Portal',
          subtitle: 'Personal attendance records, course assignments, outstanding fee balances, and doubt discussions.',
          kpis: [
            { label: 'Overall Attendance', value: loading ? '...' : `${metrics.attendancePercent}%`, icon: CalendarCheck, bg: 'var(--primary-light)', color: 'var(--primary)' },
            { label: 'Course Assignments', value: loading ? '...' : metrics.studentAssignmentsCount, icon: FileText, bg: 'var(--info-bg)', color: 'var(--info)' },
            { label: 'Pending Fee Dues', value: loading ? '...' : `₹${metrics.studentFeesDue.toFixed(2)}`, icon: CircleDollarSign, bg: 'var(--warning-bg)', color: 'var(--warning)' },
            { label: 'Academic Standing', value: 'Good', icon: GraduationCap, bg: 'var(--success-bg)', color: 'var(--success)' },
          ],
          actions: [
            { label: 'Check Subject Attendance', icon: CalendarCheck, path: '/student/attendance' },
            { label: 'Submit Coursework & Homework', icon: FileText, path: '/student/assignments' },
            { label: 'View Fee Invoices & Receipts', icon: CircleDollarSign, path: '/student/fees' },
            { label: 'Class Doubt Forum', icon: Users, path: '/student/forum' },
          ],
        };

      case 'LIBRARIAN':
        return {
          title: 'Library & Circulation Desk',
          subtitle: 'Manage catalogue records, book copies, lending circulation, and overdue returns.',
          kpis: [
            { label: 'Catalogue Titles', value: loading ? '...' : metrics.booksCount, icon: LibraryBig, bg: 'var(--primary-light)', color: 'var(--primary)' },
            { label: 'Active Circulations', value: loading ? '...' : metrics.issuesCount, icon: Clock, bg: 'var(--info-bg)', color: 'var(--info)' },
            { label: 'System Access', value: 'Live', icon: Sparkles, bg: 'var(--success-bg)', color: 'var(--success)' },
            { label: 'Database Sync', value: '100%', icon: TrendingUp, bg: 'var(--warning-bg)', color: 'var(--warning)' },
          ],
          actions: [
            { label: 'Manage Book Catalogue', icon: LibraryBig, path: '/librarian/library' },
          ],
        };

      default:
        return {
          title: 'Institute Management Dashboard',
          subtitle: 'Role-based academic operations and records.',
          kpis: [],
          actions: [],
        };
    }
  };

  const config = getRoleConfig();

  return (
    <div className={styles.dashboard}>
      {/* Welcome Banner */}
      <div className={styles.welcomeHeader}>
        <div className={styles.welcomeText}>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <div className={styles.roleTag}>
          <span className="badge badge-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
            <span style={{ textTransform: 'capitalize' }}>{user?.username}</span> • {role}
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={styles.kpiGrid}>
        {config.kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <div key={idx} className={styles.kpiCard}>
              <div className={styles.kpiInfo}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={styles.kpiValue}>{kpi.value}</span>
              </div>
              <div
                className={styles.kpiIcon}
                style={{ backgroundColor: kpi.bg, color: kpi.color }}
              >
                <IconComponent size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Section: Overview & Quick Operations */}
      <div className={styles.sectionGrid}>
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Institutional Overview</h2>
            <span className="badge badge-success">PostgreSQL Sync</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem' }}>
              Welcome to the redesigned Institute Management System (IMS). All academic and administrative workflows
              are connected to the live PostgreSQL Spring Boot backend. Use the quick action shortcuts or the sidebar navigation to manage operations.
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-hover)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Current Role Scope
                </span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0', fontSize: '1rem' }}>
                  {role} Portal
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Design System
                </span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0', fontSize: '1rem' }}>
                  Inter • Tokenized
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Backend Protocol
                </span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '4px 0 0', fontSize: '1rem' }}>
                  REST JSON v1
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations Panel */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Quick Operations</h2>
          </div>

          <div className={styles.quickActions}>
            {config.actions.map((action, idx) => {
              const ActionIcon = action.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => navigate(action.path)}
                >
                  <ActionIcon size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <span style={{ flex: 1 }}>{action.label}</span>
                  <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
