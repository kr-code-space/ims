import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  KeyRound,
  Search,
  Pencil,
  Power,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

const emptyStudentForm = () => ({
  studentNumber: '',
  firstName: '',
  lastName: '',
  department: '',
  year: '',
  className: '',
  username: '',
  password: '',
  email: '',
});

export default function StudentManagement({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(emptyStudentForm);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    apiClient.get('/admin/students')
      .then((res) => {
        if (isCurrent) {
          setStudents(res.data || []);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          const msg = err.response?.data?.message || 'Could not load student records.';
          showToast(msg, 'error');
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [apiClient, refreshKey]);

  const filteredStudents = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [
        s.studentNumber,
        s.firstName,
        s.lastName,
        s.department,
        s.className,
        s.accountUsername,
      ].some((val) => val?.toLowerCase().includes(q))
    );
  }, [students, filter]);

  const activeCount = useMemo(() => students.filter((s) => s.active).length, [students]);
  const accountCount = useMemo(() => students.filter((s) => s.accountUsername).length, [students]);

  const openCreateForm = () => {
    setEditingStudent(null);
    setForm(emptyStudentForm());
    setFormError('');
    setFormOpen(true);
  };

  const openEditForm = (student) => {
    setEditingStudent(student);
    setForm({
      studentNumber: student.studentNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      department: student.department,
      year: student.year,
      className: student.className,
      username: '',
      password: '',
      email: '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingStudent(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const accountDetails = [form.username.trim(), form.password, form.email.trim()];
    const hasAccountDetails = accountDetails.some(Boolean);
    if (!editingStudent && hasAccountDetails && accountDetails.some((val) => !val)) {
      setFormError('To create a student login, please enter username, password, and email.');
      return;
    }
    if (!editingStudent && hasAccountDetails && (form.password.length < 12 || form.password.length > 72)) {
      setFormError('Student temporary password must be between 12 and 72 characters.');
      return;
    }

    const studentDetails = {
      studentNumber: form.studentNumber.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      department: form.department.trim(),
      year: form.year.trim(),
      className: form.className.trim(),
    };

    setIsSaving(true);
    try {
      if (editingStudent) {
        await apiClient.put(`/admin/students/${editingStudent.id}`, studentDetails);
        showToast('Student record updated successfully.', 'success');
      } else {
        await apiClient.post('/admin/students', {
          ...studentDetails,
          username: form.username.trim() || null,
          password: form.password || null,
          email: form.email.trim() || null,
        });
        showToast('Student record created successfully.', 'success');
      }
      closeForm();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save student record.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (student) => {
    const nextActive = !student.active;
    if (
      !nextActive &&
      !window.confirm(
        `Deactivate student ${student.firstName} ${student.lastName}? Their account will be suspended while preserving records.`
      )
    ) {
      return;
    }

    try {
      await apiClient.put(`/admin/students/${student.id}/status`, { active: nextActive });
      showToast(
        `Student ${student.firstName} ${student.lastName} has been ${nextActive ? 'activated' : 'deactivated'}.`,
        'success'
      );
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update student status.';
      showToast(msg, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Student Management"
        description="Maintain institutional student profiles, enrollments, and linked student login credentials."
      >
        <button type="button" className="btn btn-primary" onClick={openCreateForm}>
          <UserPlus size={18} />
          <span>Add Student</span>
        </button>
      </PageHeader>

      <div className="statGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Total Students"
          value={students.length}
          icon={Users}
          color="primary"
          subtext="Enrolled in system"
        />
        <StatCard
          label="Active Students"
          value={activeCount}
          icon={UserCheck}
          color="success"
          subtext={`${activeCount} in good standing`}
        />
        <StatCard
          label="Student Logins"
          value={accountCount}
          icon={KeyRound}
          color="info"
          subtext="Linked credentials"
        />
      </div>

      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>Student Directory</span>
            <span className={tableStyles.summaryCount}>
              Showing {filteredStudents.length} of {students.length} student{students.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className={tableStyles.searchWrapper}>
            <Search size={16} className={tableStyles.searchIcon} />
            <input
              type="text"
              className={tableStyles.searchInput}
              placeholder="Search by name, roll no, department..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Department</th>
                <th>Year & Class</th>
                <th>Portal Login</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Loading student records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={tableStyles.emptyState}>
                      <Users size={36} />
                      <span>{students.length ? 'No student records match your filter query.' : 'No students registered yet. Click "Add Student" above.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <span className={tableStyles.cellPrimary}>
                        {student.firstName} {student.lastName}
                      </span>
                      <span className={tableStyles.cellSecondary}>
                        #{student.studentNumber}
                      </span>
                    </td>
                    <td>{student.department}</td>
                    <td>
                      <span className={tableStyles.cellPrimary}>{student.year}</span>
                      <span className={tableStyles.cellSecondary}>{student.className}</span>
                    </td>
                    <td>
                      {student.accountUsername ? (
                        <span className="badge badge-primary">{student.accountUsername}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No Account</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={student.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          onClick={() => openEditForm(student)}
                          title="Edit student details"
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className={`btn ${student.active ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          onClick={() => handleStatusChange(student)}
                          title={student.active ? 'Deactivate student' : 'Activate student'}
                        >
                          <Power size={14} />
                          <span>{student.active ? 'Deactivate' : 'Activate'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editingStudent ? 'Update Student Details' : 'Add New Student'}
        maxWidth={620}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {formError && (
            <div
              style={{
                backgroundColor: 'var(--danger-bg)',
                color: 'var(--danger)',
                border: '1px solid var(--danger)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.88rem',
              }}
            >
              {formError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Student Roll / Number *</label>
              <input
                type="text"
                value={form.studentNumber}
                onChange={(e) => setForm((p) => ({ ...p, studentNumber: e.target.value }))}
                placeholder="e.g. CS2026001"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Department *</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                placeholder="e.g. Computer Science"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>First Name *</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                placeholder="First name"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Last Name *</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                placeholder="Last name"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Year *</label>
              <input
                type="text"
                value={form.year}
                onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                placeholder="e.g. 1st Year, 2nd Year"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Class / Section *</label>
              <input
                type="text"
                value={form.className}
                onChange={(e) => setForm((p) => ({ ...p, className: e.target.value }))}
                placeholder="e.g. CSE-A"
                required
              />
            </div>
          </div>

          {!editingStudent && (
            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '16px',
                marginTop: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Student Login Account (Optional)
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Provide credentials to automatically create a student portal account.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    placeholder="e.g. student_john"
                    autoComplete="off"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="student@college.edu"
                    autoComplete="email"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Temporary Password (12–72 chars)</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={72}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
