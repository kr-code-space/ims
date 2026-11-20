import { useEffect, useState } from 'react'
import { KeyRound, UserRoundPlus } from 'lucide-react'
import './UserManagement.css'

const ROLES = ['ADMIN', 'FACULTY', 'STUDENT', 'LIBRARIAN']

function UserManagement({ apiClient, currentUsername }) {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyUserForm)
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [busyUserId, setBusyUserId] = useState(null)
  const [resetTarget, setResetTarget] = useState(null)
  const [resetForm, setResetForm] = useState({ password: '', confirmPassword: '' })
  const [resetError, setResetError] = useState('')

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/admin/users')
      .then((response) => {
        if (isCurrent) {
          setUsers(response.data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(getRequestError(requestError, 'Could not load user accounts.'))
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsLoading(false)
        }
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient, refreshKey])

  const filteredUsers = users.filter((user) =>
    [
      user.username,
      user.firstName,
      user.lastName,
      user.email,
      user.role,
      ...(user.permissions || []),
    ].some((value) => value?.toLowerCase().includes(filter.trim().toLowerCase())),
  )
  const enabledCount = users.filter((user) => user.enabled).length
  const facultyAccessCount = users.filter((user) => user.permissions?.includes('LAB_ACCESS')).length

  const refreshUsers = () => {
    setIsLoading(true)
    setRefreshKey((current) => current + 1)
  }

  const openCreateForm = () => {
    setForm(emptyUserForm())
    setFormError('')
    setIsCreateOpen(true)
  }

  const closeCreateForm = () => {
    setIsCreateOpen(false)
    setFormError('')
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setFormError('')
    setIsSaving(true)
    try {
      await apiClient.post('/admin/users', {
        username: form.username.trim(),
        password: form.password,
        role: form.role,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        permissions: form.role === 'FACULTY' && form.labAccess ? ['LAB_ACCESS'] : [],
      })
      closeCreateForm()
      setNotice('Account created in PostgreSQL.')
      refreshUsers()
    } catch (requestError) {
      setFormError(getRequestError(requestError, 'Could not create this account.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (user) => {
    const enabled = !user.enabled
    if (!enabled && !window.confirm(`Disable ${user.username}'s account? They will no longer be able to sign in.`)) {
      return
    }
    setError('')
    setNotice('')
    setBusyUserId(user.id)
    try {
      await apiClient.put(`/admin/users/${user.id}/status`, { enabled })
      setNotice(`Account ${enabled ? 'enabled' : 'disabled'}.`)
      refreshUsers()
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not update this account.'))
    } finally {
      setBusyUserId(null)
    }
  }

  const handlePermissionChange = async (user) => {
    const permissions = user.permissions?.includes('LAB_ACCESS') ? [] : ['LAB_ACCESS']
    setError('')
    setNotice('')
    setBusyUserId(user.id)
    try {
      await apiClient.put(`/admin/users/${user.id}/permissions`, { permissions })
      setNotice(`LAB_ACCESS ${permissions.length ? 'granted' : 'revoked'} for ${user.username}.`)
      refreshUsers()
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not update this faculty permission.'))
    } finally {
      setBusyUserId(null)
    }
  }

  const openResetForm = (user) => {
    setResetTarget(user)
    setResetForm({ password: '', confirmPassword: '' })
    setResetError('')
  }

  const closeResetForm = () => {
    setResetTarget(null)
    setResetForm({ password: '', confirmPassword: '' })
    setResetError('')
  }

  const handlePasswordReset = async (event) => {
    event.preventDefault()
    setResetError('')
    if (resetForm.password !== resetForm.confirmPassword) {
      setResetError('The passwords do not match.')
      return
    }
    if (resetForm.password.length < 12 || resetForm.password.length > 72) {
      setResetError('Passwords must be between 12 and 72 characters.')
      return
    }

    setBusyUserId(resetTarget.id)
    try {
      await apiClient.put(`/admin/users/${resetTarget.id}/password`, { password: resetForm.password })
      setNotice(`Password reset for ${resetTarget.username}. Share the new temporary password securely.`)
      closeResetForm()
    } catch (requestError) {
      setResetError(getRequestError(requestError, 'Could not reset this password.'))
    } finally {
      setBusyUserId(null)
    }
  }

  return (
    <section className="user-management">
      <div className="users-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h3>User Management</h3>
          <p className="section-description">Manage database accounts, access, and faculty permissions.</p>
        </div>
        <button type="button" className="primary-button add-user-button" onClick={openCreateForm}>
          <UserRoundPlus size={17} />
          Create account
        </button>
      </div>

      <div className="user-stats">
        <article className="metric-card">
          <span>Total accounts</span>
          <strong>{users.length}</strong>
        </article>
        <article className="metric-card">
          <span>Enabled accounts</span>
          <strong>{enabledCount}</strong>
        </article>
        <article className="metric-card">
          <span>Faculty with lab access</span>
          <strong>{facultyAccessCount}</strong>
        </article>
      </div>

      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {notice ? <p className="success-message" role="status">{notice}</p> : null}

      {isCreateOpen ? (
        <form className="panel-card user-form" onSubmit={handleCreate}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">New account</p>
              <h4>Create a user</h4>
            </div>
            <button type="button" className="text-button" onClick={closeCreateForm}>Cancel</button>
          </div>

          <div className="user-form-grid">
            <UserField label="Username" name="username" value={form.username} onChange={setForm} maxLength={255} autoComplete="off" required />
            <UserField label="First name" name="firstName" value={form.firstName} onChange={setForm} maxLength={255} required />
            <UserField label="Last name" name="lastName" value={form.lastName} onChange={setForm} maxLength={255} required />
            <UserField label="Email" name="email" type="email" value={form.email} onChange={setForm} maxLength={255} required />
            <UserField label="Temporary password" name="password" type="password" value={form.password} onChange={setForm} minLength={12} maxLength={72} autoComplete="new-password" required />
            <div className="field-row">
              <label htmlFor="user-role">Role</label>
              <select
                id="user-role"
                value={form.role}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  role: event.target.value,
                  labAccess: event.target.value === 'FACULTY' && current.labAccess,
                }))}
              >
                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          </div>

          {form.role === 'FACULTY' ? (
            <label className="permission-checkbox">
              <input
                type="checkbox"
                checked={form.labAccess}
                onChange={(event) => setForm((current) => ({ ...current, labAccess: event.target.checked }))}
              />
              Grant `LAB_ACCESS`
            </label>
          ) : null}

          <p className="form-help">Passwords are stored as BCrypt hashes and cannot be viewed later.</p>
          {formError ? <p className="error-message" role="alert">{formError}</p> : null}
          <div className="form-actions">
            <button type="button" className="text-button" onClick={closeCreateForm}>Cancel</button>
            <button type="submit" className="primary-button save-user-button" disabled={isSaving}>
              {isSaving ? 'Creating...' : 'Create account'}
            </button>
          </div>
        </form>
      ) : null}

      {resetTarget ? (
        <form className="panel-card user-form reset-user-form" onSubmit={handlePasswordReset}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Password reset</p>
              <h4>Set a temporary password for {resetTarget.username}</h4>
            </div>
            <button type="button" className="text-button" onClick={closeResetForm}>Cancel</button>
          </div>
          <div className="user-form-grid">
            <UserField label="New temporary password" name="password" type="password" value={resetForm.password} onChange={setResetForm} minLength={12} maxLength={72} autoComplete="new-password" required />
            <UserField label="Confirm password" name="confirmPassword" type="password" value={resetForm.confirmPassword} onChange={setResetForm} minLength={12} maxLength={72} autoComplete="new-password" required />
          </div>
          {resetError ? <p className="error-message" role="alert">{resetError}</p> : null}
          <div className="form-actions">
            <button type="button" className="text-button" onClick={closeResetForm}>Cancel</button>
            <button type="submit" className="primary-button save-user-button" disabled={busyUserId === resetTarget.id}>
              {busyUserId === resetTarget.id ? 'Saving...' : 'Reset password'}
            </button>
          </div>
        </form>
      ) : null}

      <section className="panel-card user-records">
        <div className="records-toolbar">
          <div>
            <h4>User accounts</h4>
            <p>{filteredUsers.length} account{filteredUsers.length === 1 ? '' : 's'}</p>
          </div>
          <input
            type="search"
            aria-label="Search user accounts"
            placeholder="Search users..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>

        {isLoading ? (
          <p className="empty-state">Loading user accounts...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="empty-state">{users.length ? 'No accounts match your search.' : 'No user accounts were found.'}</p>
        ) : (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>Status</th>
                  <th><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isSelf = user.username === currentUsername
                  const isBusy = busyUserId === user.id
                  const hasLabAccess = user.permissions?.includes('LAB_ACCESS')
                  return (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.firstName} {user.lastName}</strong>
                        <span>{user.username}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        {user.role === 'FACULTY' ? (
                          <button
                            type="button"
                            className="permission-toggle"
                            disabled={isBusy}
                            onClick={() => handlePermissionChange(user)}
                          >
                            LAB_ACCESS: {hasLabAccess ? 'On' : 'Off'}
                          </button>
                        ) : user.permissions?.length ? user.permissions.join(', ') : <span className="muted-text">None</span>}
                      </td>
                      <td>
                        <span className={user.enabled ? 'user-status enabled' : 'user-status disabled'}>
                          {user.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <div className="user-actions">
                          <button
                            type="button"
                            className="text-button"
                            disabled={isSelf || isBusy}
                            title={isSelf ? 'You cannot reset your own password from this screen.' : 'Reset this user password'}
                            onClick={() => openResetForm(user)}
                          >
                            <KeyRound size={14} />
                            Reset password
                          </button>
                          <button
                            type="button"
                            className="text-button"
                            disabled={isSelf || isBusy}
                            title={isSelf ? 'You cannot disable your own account.' : undefined}
                            onClick={() => handleStatusChange(user)}
                          >
                            {user.enabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function UserField({ label, name, value, onChange, ...inputProps }) {
  return (
    <div className="field-row">
      <label htmlFor={`user-${name}`}>{label}</label>
      <input
        id={`user-${name}`}
        name={name}
        value={value}
        onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))}
        {...inputProps}
      />
    </div>
  )
}

function emptyUserForm() {
  return {
    username: '',
    password: '',
    role: 'STUDENT',
    firstName: '',
    lastName: '',
    email: '',
    labAccess: false,
  }
}

function getRequestError(error, fallback) {
  if (error.response) {
    return error.response.data?.message
      || error.response.data?.detail
      || `${fallback} (HTTP ${error.response.status}).`
  }
  return `${fallback} Check that the backend is running.`
}

export default UserManagement
