import React, { useEffect, useState, useMemo } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Search,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

export default function StudentAttendance({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    let isCurrent = true;
    apiClient.get('/student/attendance')
      .then((res) => {
        if (!isCurrent) return;
        setRecords(res.data || []);
      })
      .catch((err) => {
        if (!isCurrent) return;
        const msg = err.response?.data?.message || 'Could not load your attendance records.';
        showToast(msg, 'error');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [apiClient]);

  const subjectStats = useMemo(() => {
    const groups = {};
    records.forEach((r) => {
      const sub = r.subjectName || 'Unknown Subject';
      if (!groups[sub]) groups[sub] = { subject: sub, total: 0, present: 0 };
      groups[sub].total += 1;
      if (r.present) groups[sub].present += 1;
    });
    return Object.values(groups).map((g) => ({
      ...g,
      rate: g.total > 0 ? Math.round((g.present / g.total) * 100) : 0,
    }));
  }, [records]);

  const overall = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.present).length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, rate };
  }, [records]);

  const filteredRecords = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [r.date, r.subjectName, r.academicClassName, r.remarks].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [records, filter]);

  return (
    <div>
      <PageHeader
        eyebrow="Academic Progress"
        title="My Attendance Record"
        description="Review personal class attendance percentages, individual subject breakdown, and complete session logs."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Overall Attendance"
          value={`${overall.rate}%`}
          icon={CalendarCheck}
          color={overall.rate >= 75 ? 'success' : 'danger'}
          subtext={overall.rate >= 75 ? 'Above 75% threshold' : 'Low attendance alert (< 75%)'}
        />
        <StatCard
          label="Attended Sessions"
          value={overall.present}
          icon={CheckCircle2}
          color="success"
          subtext="Recorded present"
        />
        <StatCard
          label="Total Classes Held"
          value={overall.total}
          icon={Clock}
          color="info"
          subtext="Sessions conducted"
        />
        <StatCard
          label="Enrolled Subjects"
          value={subjectStats.length}
          icon={TrendingUp}
          color="primary"
          subtext="Tracked courses"
        />
      </div>

      {/* Subject-wise Cards */}
      {subjectStats.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' }}>
            Subject-wise Breakdown
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            {subjectStats.map((item) => {
              const isGood = item.rate >= 75;
              return (
                <div
                  key={item.subject}
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px 20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                      {item.subject}
                    </span>
                    <span className={`badge ${isGood ? 'badge-success' : 'badge-danger'}`}>
                      {item.rate}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: '100%',
                      height: '7px',
                      backgroundColor: 'var(--bg-hover)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${item.rate}%`,
                        height: '100%',
                        backgroundColor: isGood ? 'var(--success)' : 'var(--danger)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>

                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {item.present} present out of {item.total} classes conducted
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Chronological History Table */}
      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>Attendance Session History</span>
            <span className={tableStyles.summaryCount}>
              Showing {filteredRecords.length} of {records.length} class entries
            </span>
          </div>

          <div className={tableStyles.searchWrapper}>
            <Search size={16} className={tableStyles.searchIcon} />
            <input
              type="text"
              className={tableStyles.searchInput}
              placeholder="Search by date, subject..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject Name</th>
                <th>Class Cohort</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Loading attendance history...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={tableStyles.emptyState}>
                      <CalendarCheck size={36} />
                      <span>{records.length ? 'No attendance records match your filter.' : 'No attendance recorded for your account yet.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className={tableStyles.cellPrimary}>{r.date}</span>
                    </td>
                    <td>
                      <span className={tableStyles.cellPrimary}>{r.subjectName}</span>
                    </td>
                    <td>{r.academicClassName || '-'}</td>
                    <td>
                      <StatusBadge
                        status={r.present ? 'PRESENT' : 'ABSENT'}
                      />
                    </td>
                    <td>
                      <span style={{ color: r.remarks ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '0.84rem' }}>
                        {r.remarks || 'Regular class'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
