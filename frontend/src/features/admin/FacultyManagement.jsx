import React, { useEffect, useState, useMemo } from 'react';
import {
  GraduationCap,
  UserCheck,
  UserPlus,
  Search,
  Pencil,
  Power,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

const emptyFacultyForm = () => ({
  employeeNumber: '',
  firstName: '',
  lastName: '',
  department: '',
  designation: '',
  username: '',
  password: '',
  email: '',
  labAccess: false,
});

export default function FacultyManagement({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [faculty, setFaculty] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(emptyFacultyForm);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    apiClient.get('/admin/faculty')
      .then((res) => {
        if (isCurrent) {
          setFaculty(res.data || []);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          const msg = err.response?.data?.message || 'Could not load faculty records.';
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

  const filteredFaculty = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return faculty;
    return faculty.filter((f) =>
      [
        f.employeeNumber,
        f.firstName,
        f.lastName,
        f.department,
        f.designation,
        f.accountUsername,
      ].some((val) => val?.toLowerCase().includes(q))
    );
  }, [faculty, filter]);

  const activeCount = useMemo(() => faculty.filter((f) => f.active).length, [faculty]);
  const labAccessCount = useMemo(() => faculty.filter((f) => f.labAccess).length, [faculty]);

  const openCreate = () => {
    setEditingFaculty(null);
    setForm(emptyFacultyForm());
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (member) => {
    setEditingFaculty(member);
    setForm({
      employeeNumber: member.employeeNumber,
      firstName: member.firstName,
      lastName: member.lastName,
      department: member.department,
      designation: member.designation,
      username: '',
      password: '',
      email: '',
      labAccess: Boolean(member.labAccess),
    });
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingFaculty(null);
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const accountDetails = [form.username.trim(), form.password, form.email.trim()];
    if (!editingFaculty && accountDetails.some(Boolean) && accountDetails.some((val) => !val)) {
      setFormError('Please enter username, password, and email to create a faculty login account.');
      return;
    }

    try {
      setIsSaving(true);
      const common = {
        employeeNumber: form.employeeNumber.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
      };

      if (editingFaculty) {
        await apiClient.put(`/admin/faculty/${editingFaculty.id}`, common);
        showToast('Faculty record updated.', 'success');
      } else {
        await apiClient.post('/admin/faculty', {
          ...common,
          username: form.username.trim() || null,
          password: form.password || null,
          email: form.email.trim() || null,
          labAccess: form.labAccess,
        });
        showToast('Faculty record created.', 'success');
      }
      closeForm();
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save faculty record.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (member) => {
    const nextActive = !member.active;
    if (
      !nextActive &&
      !window.confirm(
        `Deactivate faculty member ${member.firstName} ${member.lastName}? Their account will be suspended.`
      )
    ) {
      return;
    }

    try {
      await apiClient.put(`/admin/faculty/${member.id}/status`, { active: nextActive });
      showToast(
        `Faculty ${member.firstName} ${member.lastName} ${nextActive ? 'activated' : 'deactivated'}.`,
        'success'
      );
      setRefreshKey((k) => k + 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update faculty status.';
      showToast(msg, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="Faculty Management"
        description="Maintain teaching staff profiles, departmental designations, and lab privileges."
      >
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          <UserPlus size={18} />
          <span>Add Faculty</span>
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Total Faculty"
          value={faculty.length}
          icon={GraduationCap}
          color="primary"
          subtext="Faculty registered"
        />
        <StatCard
          label="Active Faculty"
          value={activeCount}
          icon={UserCheck}
          color="success"
          subtext={`${activeCount} active teaching staff`}
        />
        <StatCard
          label="Lab Access Grants"
          value={labAccessCount}
          icon={ShieldCheck}
          color="warning"
          subtext="Authorized for laboratory"
        />
      </div>

      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>Faculty Staff Directory</span>
            <span className={tableStyles.summaryCount}>
              Showing {filteredFaculty.length} of {faculty.length} faculty member{faculty.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className={tableStyles.searchWrapper}>
            <Search size={16} className={tableStyles.searchIcon} />
            <input
              type="text"
              className={tableStyles.searchInput}
              placeholder="Search faculty by name, ID, designation..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Department</th>
                <th>Designation</th>
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
                      <span>Loading faculty records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFaculty.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={tableStyles.emptyState}>
                      <GraduationCap size={36} />
                      <span>{faculty.length ? 'No faculty records match your search filter.' : 'No faculty records added yet.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFaculty.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <span className={tableStyles.cellPrimary}>
                        {member.firstName} {member.lastName}
                      </span>
                      <span className={tableStyles.cellSecondary}>
                        #{member.employeeNumber}
                      </span>
                    </td>
                    <td>{member.department}</td>
                    <td>
                      <span className={tableStyles.cellPrimary}>{member.designation}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {member.accountUsername ? (
                          <span className="badge badge-primary">{member.accountUsername}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No Account</span>
                        )}
                        {member.labAccess && (
                          <span className="badge badge-warning">LAB_ACCESS</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={member.active ? 'ACTIVE' : 'INACTIVE'} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          onClick={() => openEdit(member)}
                          title="Edit faculty record"
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className={`btn ${member.active ? 'btn-secondary' : 'btn-primary'}`}
                          style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                          onClick={() => changeStatus(member)}
                          title={member.active ? 'Deactivate faculty' : 'Activate faculty'}
                        >
                          <Power size={14} />
                          <span>{member.active ? 'Deactivate' : 'Activate'}</span>
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
        title={editingFaculty ? 'Update Faculty Details' : 'Add New Faculty Member'}
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
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Employee ID *</label>
              <input
                type="text"
                value={form.employeeNumber}
                onChange={(e) => setForm((p) => ({ ...p, employeeNumber: e.target.value }))}
                placeholder="e.g. EMP-1042"
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Designation *</label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                placeholder="e.g. Associate Professor, Lecturer"
                required
              />
            </div>
          </div>

          {!editingFaculty && (
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
                  Faculty Portal Login (Optional)
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Create linked login credentials for teaching portal access.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    placeholder="e.g. prof_smith"
                    autoComplete="off"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="smith@college.edu"
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

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={form.labAccess}
                      onChange={(e) => setForm((p) => ({ ...p, labAccess: e.target.checked }))}
                    />
                    <span>Grant <strong>LAB_ACCESS</strong> authority (Laboratory equipment management)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeForm} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingFaculty ? 'Save Changes' : 'Create Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
