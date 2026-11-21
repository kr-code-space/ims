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
  CheckCircle2,
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

  const [adminData, setAdminData] = useState({
    activeTerm: null,
    departmentName: '',
    activeStudents: 0,
    totalBilled: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    recentAudit: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function fetchDashboardData() {
      setLoading(true);
      try {
        if (role === 'ADMIN') {
          const [studentsRes, facultyRes, usersRes, academicRes, feesRes, auditRes] = await Promise.allSettled([
            apiClient.get('/admin/students'),
            apiClient.get('/admin/faculty'),
            apiClient.get('/admin/users'),
            apiClient.get('/admin/academic'),
            apiClient.get('/admin/fees'),
            apiClient.get('/admin/audit'),
          ]);

          if (!isCurrent) return;

          const studentsData = studentsRes.status === 'fulfilled' && Array.isArray(studentsRes.value.data) ? studentsRes.value.data : [];
          const facultyData = facultyRes.status === 'fulfilled' && Array.isArray(facultyRes.value.data) ? facultyRes.value.data : [];
          const usersData = usersRes.status === 'fulfilled' && Array.isArray(usersRes.value.data) ? usersRes.value.data : [];
          const academicData = academicRes.status === 'fulfilled' && academicRes.value.data ? academicRes.value.data : {};
          const feesData = feesRes.status === 'fulfilled' && Array.isArray(feesRes.value.data) ? feesRes.value.data : [];
          const auditData = auditRes.status === 'fulfilled' && Array.isArray(auditRes.value.data) ? auditRes.value.data : [];

          const billed = feesData.reduce((sum, f) => sum + Number(f.amount || 0), 0);
          const paid = feesData.reduce((sum, f) => sum + Number(f.paidAmount || 0), 0);

          setMetrics((prev) => ({
            ...prev,
            studentsCount: studentsData.length,
            facultyCount: facultyData.length,
            usersCount: usersData.length,
            departmentsCount: academicData?.departments?.length || 0,
            academicClasses: academicData?.classes?.length || 0,
            feesCount: feesData.length,
          }));

          const activeTerm = academicData?.terms?.find((t) => t.active) || (academicData?.terms?.length ? academicData.terms[0] : null);
          const primaryDept = academicData?.departments?.length ? academicData.departments[0].name : '';

          setAdminData({
            activeTerm,
            departmentName: primaryDept,
            activeStudents: studentsData.filter((s) => s.active).length,
            totalBilled: billed,
            totalPaid: paid,
            totalOutstanding: Math.max(0, billed - paid),
            recentAudit: auditData.slice(0, 4),
          });
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

      {/* Main Section: Institutional Overview & Quick Operations */}
      <div className={styles.sectionGrid}>
        {/* Role-tailored Institutional Center */}
        {role === 'ADMIN' ? (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Campus at a Glance</h2>
              <span className="badge badge-primary">
                {adminData.activeTerm ? `${adminData.activeTerm.name} • Active` : 'Academic Session'}
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', margin: '0 0 16px' }}>
              Welcome, Administrator. Here is your institutional operational summary across active academic sessions, student enrollments, and tuition fee realization.
            </p>

            <div className={styles.glanceGrid}>
              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Current Academic Session</span>
                <p className={styles.glanceValue}>
                  {adminData.activeTerm ? adminData.activeTerm.name : 'Semester Term'}
                </p>
                <span className={styles.glanceSubtext}>
                  {adminData.departmentName || `${metrics.departmentsCount} Academic Department(s)`}
                </span>
              </div>

              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Student Enrollment</span>
                <p className={styles.glanceValue}>
                  {adminData.activeStudents} / {metrics.studentsCount} Active
                </p>
                <span className={styles.glanceSubtext}>
                  {metrics.studentsCount > 0
                    ? `${Math.round((adminData.activeStudents / metrics.studentsCount) * 100)}% active standing`
                    : 'Enrolled students'}
                </span>
              </div>

              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Fee Collection Realization</span>
                <p className={styles.glanceValue}>
                  ₹{adminData.totalPaid.toFixed(2)}
                </p>
                <span className={styles.glanceSubtext}>
                  {adminData.totalBilled > 0
                    ? `${Math.round((adminData.totalPaid / adminData.totalBilled) * 100)}% collected`
                    : 'Fees collected'}
                  {adminData.totalOutstanding > 0 ? ` (₹${adminData.totalOutstanding.toFixed(2)} dues)` : ' (All clear)'}
                </span>
              </div>
            </div>

            {adminData.recentAudit.length > 0 ? (
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Recent System Activity
                </div>
                <div className={styles.activityList}>
                  {adminData.recentAudit.map((item) => (
                    <div key={item.id} className={styles.activityItem}>
                      <div>
                        <span className="badge badge-primary" style={{ marginRight: '8px' }}>{item.action}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{item.details || item.entityType}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {item.occurredAt ? new Date(item.occurredAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.noticeBanner}>
                <CheckCircle2 size={20} style={{ color: 'var(--success)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Institutional operations normal.</strong> All campus departments, faculty allocations, and student authentication services are operational.
                </div>
              </div>
            )}
          </div>
        ) : role === 'FACULTY' ? (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Teaching & Classroom Overview</h2>
              <span className="badge badge-success">Faculty Portal</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', margin: '0 0 16px' }}>
              Welcome, Faculty Member. Access assigned course sections, record daily lecture attendance, and grade submitted coursework.
            </p>

            <div className={styles.glanceGrid}>
              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Assigned Offerings</span>
                <p className={styles.glanceValue}>{metrics.offeringsCount} Classes</p>
                <span className={styles.glanceSubtext}>Active teaching sections</span>
              </div>

              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Coursework Tasks</span>
                <p className={styles.glanceValue}>{metrics.assignmentsCount} Assignments</p>
                <span className={styles.glanceSubtext}>Published to students</span>
              </div>

              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Laboratory Authority</span>
                <p className={styles.glanceValue}>{metrics.labEquipmentCount > 0 ? 'Equipment Active' : 'Standard Access'}</p>
                <span className={styles.glanceSubtext}>Laboratory supervision</span>
              </div>
            </div>

            <div className={styles.noticeBanner}>
              <CalendarCheck size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Daily Attendance Reminder:</strong> Submit attendance records for all completed lecture periods to keep institutional compliance up to date.
              </div>
            </div>
          </div>
        ) : role === 'STUDENT' ? (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Academic Standing & Coursework</h2>
              <span className="badge badge-primary">Student Portal</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', margin: '0 0 16px' }}>
              Welcome, Student. Track your lecture attendance rate, turn in assignments, inspect outstanding dues, and consult the doubt forum.
            </p>

            <div className={styles.glanceGrid}>
              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Attendance Rate</span>
                <p className={styles.glanceValue} style={{ color: metrics.attendancePercent >= 75 ? 'var(--success)' : 'var(--warning)' }}>
                  {metrics.attendancePercent}%
                </p>
                <span className={styles.glanceSubtext}>
                  {metrics.attendancePercent >= 75 ? 'Eligible for examinations' : 'Attendance warning'}
                </span>
              </div>

              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Active Tasks</span>
                <p className={styles.glanceValue}>{metrics.studentAssignmentsCount} Coursework</p>
                <span className={styles.glanceSubtext}>Assigned homework & labs</span>
              </div>

              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Semester Fees</span>
                <p className={styles.glanceValue} style={{ color: metrics.studentFeesDue > 0 ? 'var(--warning)' : 'var(--success)' }}>
                  ₹{metrics.studentFeesDue.toFixed(2)}
                </p>
                <span className={styles.glanceSubtext}>
                  {metrics.studentFeesDue > 0 ? 'Pending dues balance' : 'All fees cleared'}
                </span>
              </div>
            </div>

            <div className={styles.noticeBanner}>
              <GraduationCap size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Examination Requirement:</strong> Maintain at least 75% aggregate attendance across all enrolled subjects to remain in good academic standing.
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.contentCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Circulation Desk & Stock Overview</h2>
              <span className="badge badge-primary">Library Desk</span>
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.92rem', margin: '0 0 16px' }}>
              Welcome, Librarian. Manage the institutional book catalogue, inspect student borrowing requests, and record returned book issues.
            </p>

            <div className={styles.glanceGrid}>
              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Catalogue Titles</span>
                <p className={styles.glanceValue}>{metrics.booksCount} Titles</p>
                <span className={styles.glanceSubtext}>Catalogued library holdings</span>
              </div>

              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Active Loans</span>
                <p className={styles.glanceValue}>{metrics.issuesCount} Issues</p>
                <span className={styles.glanceSubtext}>Current circulations</span>
              </div>

              <div className={styles.glanceCard}>
                <span className={styles.glanceLabel}>Catalogue Sync</span>
                <p className={styles.glanceValue}>Active</p>
                <span className={styles.glanceSubtext}>PostgreSQL circulation desk</span>
              </div>
            </div>

            <div className={styles.noticeBanner}>
              <LibraryBig size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Circulation Desk Active:</strong> Review active loan return dates and record new book issues in the Library module.
              </div>
            </div>
          </div>
        )}

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
