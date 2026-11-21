import React, { useEffect, useState, useMemo } from 'react';
import {
  CalendarCheck,
  Users,
  CheckCircle2,
  XCircle,
  Save,
  CheckCheck,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import tableStyles from '../../styles/DataTable.module.css';

export default function FacultyAttendance({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [offerings, setOfferings] = useState([]);
  const [offeringId, setOfferingId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [remarks, setRemarks] = useState({});
  const [loadingOfferings, setLoadingOfferings] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    apiClient.get('/faculty/attendance/offerings')
      .then((res) => {
        if (!isCurrent) return;
        const list = res.data || [];
        setOfferings(list);
        if (list.length > 0) {
          setOfferingId(String(list[0].offeringId));
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        const msg = err.response?.data?.message || 'Could not load assigned course offerings.';
        showToast(msg, 'error');
      })
      .finally(() => {
        if (isCurrent) setLoadingOfferings(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [apiClient]);

  const selectedOffering = useMemo(
    () => offerings.find((item) => String(item.offeringId) === String(offeringId)),
    [offerings, offeringId]
  );

  const loadRoster = async () => {
    if (!selectedOffering || !date) return;
    setLoadingRoster(true);

    try {
      const [rosterRes, recordsRes] = await Promise.all([
        apiClient.get('/faculty/attendance/roster', {
          params: {
            academicClassId: selectedOffering.academicClassId,
            subjectId: selectedOffering.subjectId,
          },
        }),
        apiClient.get('/faculty/attendance/records', {
          params: {
            academicClassId: selectedOffering.academicClassId,
            subjectId: selectedOffering.subjectId,
            date,
          },
        }),
      ]);

      const rosterList = rosterRes.data || [];
      const recordsList = recordsRes.data || [];
      setRoster(rosterList);

      const recordMap = Object.fromEntries(
        recordsList.map((r) => [r.studentId, { present: r.present, remarks: r.remarks || '' }])
      );

      const initialAttendance = {};
      const initialRemarks = {};

      rosterList.forEach((entry) => {
        if (recordMap[entry.studentId]) {
          initialAttendance[entry.studentId] = recordMap[entry.studentId].present;
          initialRemarks[entry.studentId] = recordMap[entry.studentId].remarks;
        } else {
          // Default to present on new sheet
          initialAttendance[entry.studentId] = true;
          initialRemarks[entry.studentId] = '';
        }
      });

      setAttendance(initialAttendance);
      setRemarks(initialRemarks);
      showToast(`Loaded roster for ${rosterList.length} students.`, 'info');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load attendance roster.';
      showToast(msg, 'error');
    } finally {
      setLoadingRoster(false);
    }
  };

  // Auto load roster when offering or date changes
  useEffect(() => {
    if (selectedOffering && date) {
      loadRoster();
    }
  }, [offeringId, date]);

  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    roster.forEach((entry) => {
      if (attendance[entry.studentId]) present += 1;
      else absent += 1;
    });
    const total = roster.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, total, rate };
  }, [roster, attendance]);

  const toggleStudent = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const markAll = (status) => {
    const updated = {};
    roster.forEach((entry) => {
      updated[entry.studentId] = status;
    });
    setAttendance(updated);
    showToast(status ? 'Marked all students present.' : 'Marked all students absent.', 'info');
  };

  const handleSave = async () => {
    if (!selectedOffering || !date || roster.length === 0) return;
    setIsSaving(true);

    try {
      await apiClient.post('/faculty/attendance/records', {
        academicClassId: selectedOffering.academicClassId,
        subjectId: selectedOffering.subjectId,
        date,
        entries: roster.map((entry) => ({
          studentId: entry.studentId,
          present: Boolean(attendance[entry.studentId]),
          remarks: remarks[entry.studentId] || '',
        })),
      });
      showToast(`Attendance saved for ${date} (${counts.present}/${counts.total} present).`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save attendance records.';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Classroom Register"
        title="Class Attendance"
        description="Select assigned subject offering, pick session date, mark present or absent statuses, and commit attendance register."
      >
        {roster.length > 0 && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save size={18} />
            <span>{isSaving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        )}
      </PageHeader>

      {/* Offering Selector Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr)) auto',
          gap: '16px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Assigned Course Offering *
          </label>
          <select
            value={offeringId}
            onChange={(e) => setOfferingId(e.target.value)}
            disabled={loadingOfferings}
          >
            {offerings.length === 0 ? (
              <option value="">No course offerings assigned to you</option>
            ) : (
              offerings.map((item) => (
                <option key={item.offeringId} value={item.offeringId}>
                  {item.academicClassName} — {item.subjectName}
                </option>
              ))
            )}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Session Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => markAll(true)}
            disabled={roster.length === 0}
            title="Mark entire roster present"
          >
            <CheckCheck size={16} />
            <span>All Present</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => markAll(false)}
            disabled={roster.length === 0}
            title="Mark entire roster absent"
          >
            <XCircle size={16} />
            <span>All Absent</span>
          </button>
        </div>
      </div>

      {/* Real-time Attendance KPI Strip */}
      {roster.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <StatCard
            label="Total Enrolled"
            value={counts.total}
            icon={Users}
            color="primary"
            subtext="Students in class"
          />
          <StatCard
            label="Present Today"
            value={counts.present}
            icon={CheckCircle2}
            color="success"
            subtext={`${counts.rate}% attendance rate`}
          />
          <StatCard
            label="Absent Today"
            value={counts.absent}
            icon={XCircle}
            color="danger"
            subtext="Marked absent"
          />
          <StatCard
            label="Session Date"
            value={date}
            icon={Calendar}
            color="info"
            subtext={selectedOffering?.subjectName || 'Current Subject'}
          />
        </div>
      )}

      {/* Attendance Roster Table */}
      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>
              {selectedOffering ? `${selectedOffering.academicClassName} • ${selectedOffering.subjectName}` : 'Student Roster'}
            </span>
            <span className={tableStyles.summaryCount}>
              {roster.length ? `${counts.present} of ${counts.total} Present (${counts.rate}%)` : 'Select an offering to begin'}
            </span>
          </div>

          {roster.length > 0 && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Sheet'}</span>
            </button>
          )}
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th>Student</th>
                <th>Student ID</th>
                <th style={{ width: '220px', textAlign: 'center' }}>Attendance Status</th>
                <th>Optional Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loadingRoster ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Loading class roster...</span>
                    </div>
                  </td>
                </tr>
              ) : roster.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className={tableStyles.emptyState}>
                      <Users size={36} />
                      <span>No students enrolled in this offering or class is empty.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                roster.map((entry, index) => {
                  const isPresent = Boolean(attendance[entry.studentId]);
                  return (
                    <tr
                      key={entry.studentId}
                      style={{
                        backgroundColor: isPresent ? 'transparent' : 'var(--danger-bg)',
                        transition: 'background-color var(--transition-fast)',
                      }}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                        {index + 1}
                      </td>
                      <td>
                        <span className={tableStyles.cellPrimary}>{entry.studentName}</span>
                      </td>
                      <td>
                        <span className="badge badge-primary">#{entry.studentNumber}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', overflow: 'hidden', padding: '2px' }}>
                          <button
                            type="button"
                            onClick={() => toggleStudent(entry.studentId)}
                            style={{
                              padding: '5px 14px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: 'none',
                              backgroundColor: isPresent ? 'var(--success)' : 'transparent',
                              color: isPresent ? '#ffffff' : 'var(--text-muted)',
                              transition: 'all var(--transition-fast)',
                            }}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStudent(entry.studentId)}
                            style={{
                              padding: '5px 14px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              border: 'none',
                              backgroundColor: !isPresent ? 'var(--danger)' : 'transparent',
                              color: !isPresent ? '#ffffff' : 'var(--text-muted)',
                              transition: 'all var(--transition-fast)',
                            }}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          placeholder="Note (e.g. excused, late)"
                          value={remarks[entry.studentId] || ''}
                          onChange={(e) =>
                            setRemarks((prev) => ({
                              ...prev,
                              [entry.studentId]: e.target.value,
                            }))
                          }
                          style={{
                            padding: '6px 10px',
                            fontSize: '0.84rem',
                            width: '100%',
                            maxWidth: '240px',
                          }}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
