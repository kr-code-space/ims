import { useEffect, useState } from 'react'
import './FacultyManagement.css'

const emptyForm = () => ({
  employeeNumber: '',
  firstName: '',
  lastName: '',
  department: '',
  designation: '',
  username: '',
  password: '',
  email: '',
  labAccess: false,
})

function FacultyManagement({ apiClient }) {
  const [faculty, setFaculty] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [filter, setFilter] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/admin/faculty')
      setFaculty(response.data)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load faculty records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/admin/faculty')
      .then((response) => {
        if (isCurrent) {
          setFaculty(response.data)
          setLoading(false)
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Could not load faculty records.')
          setLoading(false)
        }
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }))
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  const openEdit = (member) => {
    setEditing(member)
    setForm({
      employeeNumber: member.employeeNumber,
      firstName: member.firstName,
      lastName: member.lastName,
      department: member.department,
      designation: member.designation,
      username: '',
      password: '',
      email: '',
      labAccess: member.labAccess,
    })
    setFormOpen(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    const accountDetails = [form.username.trim(), form.password, form.email.trim()]
    if (!editing && accountDetails.some(Boolean) && accountDetails.some((value) => !value)) {
      setError('Enter a username, password, and email to create a faculty login.')
      return
    }
    try {
      const common = {
        employeeNumber: form.employeeNumber.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
      }
      if (editing) {
        await apiClient.put(`/admin/faculty/${editing.id}`, common)
      } else {
        await apiClient.post('/admin/faculty', {
          ...common,
          username: form.username.trim() || null,
          password: form.password || null,
          email: form.email.trim() || null,
          labAccess: form.labAccess,
        })
      }
      setNotice(editing ? 'Faculty record updated.' : 'Faculty record created.')
      setFormOpen(false)
      setEditing(null)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save the faculty record.')
    }
  }

  const changeStatus = async (member) => {
    setError('')
    setNotice('')
    try {
      await apiClient.put(`/admin/faculty/${member.id}/status`, { active: !member.active })
      setNotice(`Faculty record ${member.active ? 'deactivated' : 'activated'}.`)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update faculty status.')
    }
  }

  const filtered = faculty.filter((member) =>
    [member.employeeNumber, member.firstName, member.lastName, member.department, member.designation, member.accountUsername]
      .some((value) => value?.toLowerCase().includes(filter.trim().toLowerCase())),
  )

  return (
    <section className="faculty-management">
      <div className="faculty-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h3>Faculty Management</h3>
          <p className="section-description">Maintain faculty records and optional login accounts.</p>
        </div>
        <button type="button" className="primary-button" onClick={openCreate}>Add faculty</button>
      </div>

      <div className="faculty-stats">
        <article className="metric-card"><span>Total faculty</span><strong>{faculty.length}</strong></article>
        <article className="metric-card"><span>Active</span><strong>{faculty.filter((item) => item.active).length}</strong></article>
        <article className="metric-card"><span>Login accounts</span><strong>{faculty.filter((item) => item.accountUsername).length}</strong></article>
      </div>

      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {notice ? <p className="success-message" role="status">{notice}</p> : null}

      {formOpen ? (
        <form className="panel-card faculty-form" onSubmit={submit}>
          <h4>{editing ? 'Edit faculty record' : 'Create faculty record'}</h4>
          <FacultyField label="Employee number" name="employeeNumber" value={form.employeeNumber} onChange={updateField} />
          <FacultyField label="First name" name="firstName" value={form.firstName} onChange={updateField} />
          <FacultyField label="Last name" name="lastName" value={form.lastName} onChange={updateField} />
          <FacultyField label="Department" name="department" value={form.department} onChange={updateField} />
          <FacultyField label="Designation" name="designation" value={form.designation} onChange={updateField} />
          {!editing ? (
            <>
              <FacultyField label="Login username" name="username" value={form.username} onChange={updateField} optional />
              <FacultyField label="Temporary password" name="password" type="password" value={form.password} onChange={updateField} optional />
              <FacultyField label="Login email" name="email" type="email" value={form.email} onChange={updateField} optional />
              <label className="faculty-checkbox">
                <input type="checkbox" checked={form.labAccess} onChange={(event) => updateField('labAccess', event.target.checked)} />
                Grant LAB_ACCESS
              </label>
            </>
          ) : null}
          <div className="faculty-form-actions">
            <button type="button" className="text-button" onClick={() => setFormOpen(false)}>Cancel</button>
            <button type="submit" className="primary-button">{editing ? 'Save changes' : 'Create faculty'}</button>
          </div>
        </form>
      ) : null}

      <section className="panel-card faculty-records">
        <div className="faculty-toolbar">
          <strong>{filtered.length} faculty record{filtered.length === 1 ? '' : 's'}</strong>
          <input type="search" placeholder="Search faculty..." value={filter} onChange={(event) => setFilter(event.target.value)} />
        </div>
        {loading ? (
          <p className="empty-state">Loading faculty records...</p>
        ) : (
          <div className="faculty-table-wrap">
            <table className="faculty-table">
              <thead><tr><th>Faculty</th><th>Department</th><th>Designation</th><th>Login</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((member) => (
                  <tr key={member.id}>
                    <td><strong>{member.firstName} {member.lastName}</strong><span>{member.employeeNumber}</span></td>
                    <td>{member.department}</td>
                    <td>{member.designation}</td>
                    <td>{member.accountUsername || 'Not created'}{member.labAccess ? <span className="lab-badge">LAB_ACCESS</span> : null}</td>
                    <td><span className={member.active ? 'status-badge active' : 'status-badge inactive'}>{member.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className="faculty-actions">
                        <button type="button" className="text-button" onClick={() => openEdit(member)}>Edit</button>
                        <button type="button" className="text-button" onClick={() => changeStatus(member)}>{member.active ? 'Deactivate' : 'Activate'}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length ? <p className="empty-state">No faculty records match.</p> : null}
          </div>
        )}
      </section>
    </section>
  )
}

function FacultyField({ label, name, type = 'text', value, onChange, optional = false }) {
  return (
    <div className="faculty-field">
      <label htmlFor={`faculty-${name}`}>{label}</label>
      <input id={`faculty-${name}`} type={type} value={value} onChange={(event) => onChange(name, event.target.value)} required={!optional} />
    </div>
  )
}

export default FacultyManagement
