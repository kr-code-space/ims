import React, { useEffect, useState, useMemo } from 'react';
import {
  UserCog,
  UserCheck,
  UserPlus,
  KeyRound,
  ShieldCheck,
  Search,
  Power,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

const ROLES = ['ADMIN', 'FACULTY', 'STUDENT', 'LIBRARIAN'];

const emptyUserForm = () => ({
  username: '',
  password: '',
  role: 'STUDENT',
  firstName: '',
  lastName: '',
  email: '',
  labAccess: false,
});

export default function UserManagement({ apiClient: propClient, currentUsername: propUsername }) {
  const { apiClient: authClient, user: authUser } = useAuth();
  const apiClient = propClient || authClient;
  const currentUsername = propUsername || authUser?.username;
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyUserForm);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [busyUserId, setBusyUserId] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);

    apiClient.get('/admin/users')
      .then((res) => {
        if (isCurrent) {
          setUsers(res.data || []);
        }
      })
      .catch((err) => {
        if (isCurrent) {
          const msg = err.response?.data?.message || 'Could not load user accounts.';
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

  const filteredUsers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [
        u.username,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        ...(u.permissions || []),
      ].some((val) => val?.toLowerCase().includes(q))
    );
  }, [users, filter]);

  const enabledCount = useMemo(() => users.filter((u) => u.enabled).length, [users]);
  const facultyLabCount = useMemo(
    () => users.filter((u) => u.permissions?.includes('LAB_ACCESS')).length,
    [users]
  );

  const refreshUsers = () => {
    setRefreshKey((k) => k + 1);
  };

  const openCreateForm = () => {
    setForm(emptyUserForm());
    setFormError('');
    setIsCreateOpen(true);
  };

  const closeCreateForm = () => {
    setIsCreateOpen(false);
    setFormError('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');

    if (form.password.length < 12 || form.password.length > 72) {
      setFormError('Temporary password must be between 12 and 72 characters.');
      return;
    }

    setIsSaving(true);
    try {
      await apiClient.post('/admin/users', {
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        permissions: form.role === 'FACULTY' && form.labAccess ? ['LAB_ACCESS'] : [],
      });
      showToast(`User account '${form.username}' created.`, 'success');
      closeCreateForm();
      refreshUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create account.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (targetUser) => {
    const nextEnabled = !targetUser.enabled;
    if (
      !nextEnabled &&
      !window.confirm(`Disable account '${targetUser.username}'? They will no longer be able to log in.`)
    ) {
      return;
    }

    setBusyUserId(targetUser.id);
    try {
      await apiClient.put(`/admin/users/${targetUser.id}/status`, { enabled: nextEnabled });
      showToast(`Account '${targetUser.username}' ${nextEnabled ? 'enabled' : 'disabled'}.`, 'success');
      refreshUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update account status.';
      showToast(msg, 'error');
    } finally {
      setBusyUserId(null);
    }
  };

  const handlePermissionChange = async (targetUser) => {
    const hasLab = targetUser.permissions?.includes('LAB_ACCESS');
    const nextPerms = hasLab ? [] : ['LAB_ACCESS'];

    setBusyUserId(targetUser.id);
    try {
      await apiClient.put(`/admin/users/${targetUser.id}/permissions`, { permissions: nextPerms });
      showToast(
        `LAB_ACCESS ${nextPerms.length ? 'granted to' : 'revoked from'} ${targetUser.username}.`,
        'success'
      );
      refreshUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not update permissions.';
      showToast(msg, 'error');
    } finally {
      setBusyUserId(null);
    }
  };

  const openResetForm = (targetUser) => {
    setResetTarget(targetUser);
    setResetForm({ password: '', confirmPassword: '' });
    setResetError('');
  };

  const closeResetForm = () => {
    setResetTarget(null);
    setResetForm({ password: '', confirmPassword: '' });
    setResetError('');
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetError('');

    if (resetForm.password !== resetForm.confirmPassword) {
      setResetError('The passwords do not match.');
      return;
    }
    if (resetForm.password.length < 12 || resetForm.password.length > 72) {
      setResetError('Passwords must be between 12 and 72 characters.');
      return;
    }

    setBusyUserId(resetTarget.id);
    try {
      await apiClient.put(`/admin/users/${resetTarget.id}/password`, {
        password: resetForm.password,
      });
      showToast(`Password reset for ${resetTarget.username}.`, 'success');
      closeResetForm();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not reset password.';
      setResetError(msg);
      showToast(msg, 'error');
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Administration"
        title="User Accounts & Security"
        description="Manage portal user authentication, account privileges, roles, and password resets."
      >
        <button type="button" className="btn btn-primary" onClick={openCreateForm}>
          <UserPlus size={18} />
          <span>Create Account</span>
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Total Accounts"
          value={users.length}
          icon={UserCog}
          color="primary"
          subtext="Registered users"
        />
        <StatCard
          label="Active Accounts"
          value={enabledCount}
          icon={UserCheck}
          color="success"
          subtext={`${enabledCount} accounts enabled`}
        />
        <StatCard
          label="Lab Access Grants"
          value={facultyLabCount}
          icon={ShieldCheck}
          color="warning"
          subtext="Faculty privileges"
        />
      </div>

      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>User Directory</span>
            <span className={tableStyles.summaryCount}>
              Showing {filteredUsers.length} of {users.length} registered account{users.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className={tableStyles.searchWrapper}>
            <Search size={16} className={tableStyles.searchIcon} />
            <input
              type="text"
              className={tableStyles.searchInput}
              placeholder="Search by username, name, email, role..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Scoped Permissions</th>
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
                      <span>Loading user accounts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={tableStyles.emptyState}>
                      <UserCog size={36} />
                      <span>{users.length ? 'No user accounts match your search filter.' : 'No user accounts found.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.username === currentUsername;
                  const isBusy = busyUserId === u.id;
                  const hasLabAccess = u.permissions?.includes('LAB_ACCESS');

                  return (
                    <tr key={u.id}>
                      <td>
                        <span className={tableStyles.cellPrimary}>
                          {u.firstName} {u.lastName} {isSelf && <span className="badge badge-primary" style={{ marginLeft: '4px' }}>You</span>}
                        </span>
                        <span className={tableStyles.cellSecondary}>@{u.username}</span>
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <span className="badge badge-primary">{u.role}</span>
                      </td>
                      <td>
                        {u.role === 'FACULTY' ? (
                          <button
                            type="button"
                            className={`btn ${hasLabAccess ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
                            disabled={isBusy}
                            onClick={() => handlePermissionChange(u)}
                            title="Toggle LAB_ACCESS permission"
                          >
                            LAB_ACCESS: {hasLabAccess ? 'Active' : 'Off'}
                          </button>
                        ) : u.permissions?.length ? (
                          <span>{u.permissions.join(', ')}</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>Standard</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={u.enabled ? 'ACTIVE' : 'INACTIVE'} label={u.enabled ? 'Enabled' : 'Disabled'} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                            disabled={isSelf || isBusy}
                            onClick={() => openResetForm(u)}
                            title={isSelf ? 'Change your own password via account settings' : 'Reset password for user'}
                          >
                            <KeyRound size={14} />
                            <span>Reset</span>
                          </button>
                          <button
                            type="button"
                            className={`btn ${u.enabled ? 'btn-secondary' : 'btn-primary'}`}
                            style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                            disabled={isSelf || isBusy}
                            onClick={() => handleStatusChange(u)}
                            title={isSelf ? 'Cannot disable self' : u.enabled ? 'Disable account' : 'Enable account'}
                          >
                            <Power size={14} />
                            <span>{u.enabled ? 'Disable' : 'Enable'}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={closeCreateForm}
        title="Create New User Account"
        maxWidth={580}
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Username *</label>
              <input
                type="text"
                placeholder="e.g. jsmith"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>System Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                required
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>First Name *</label>
              <input
                type="text"
                placeholder="First name"
                value={form.firstName}
                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Last Name *</label>
              <input
                type="text"
                placeholder="Last name"
                value={form.lastName}
                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Email Address *</label>
              <input
                type="email"
                placeholder="user@college.edu"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Temporary Password (12–72 characters) *</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                minLength={12}
                maxLength={72}
                required
              />
            </div>
          </div>

          {form.role === 'FACULTY' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
              <input
                type="checkbox"
                checked={form.labAccess}
                onChange={(e) => setForm((p) => ({ ...p, labAccess: e.target.checked }))}
              />
              <span>Grant <strong>LAB_ACCESS</strong> authority</span>
            </label>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeCreateForm} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        isOpen={Boolean(resetTarget)}
        onClose={closeResetForm}
        title={`Reset Password for ${resetTarget?.username}`}
        maxWidth={480}
      >
        <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {resetError && (
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
              {resetError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>New Temporary Password (12–72 chars) *</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={resetForm.password}
              onChange={(e) => setResetForm((p) => ({ ...p, password: e.target.value }))}
              minLength={12}
              maxLength={72}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Confirm New Password *</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={resetForm.confirmPassword}
              onChange={(e) => setResetForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              minLength={12}
              maxLength={72}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeResetForm}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={busyUserId === resetTarget?.id}>
              {busyUserId === resetTarget?.id ? 'Updating...' : 'Set Password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
