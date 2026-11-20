import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowRight,
  GraduationCap,
  LibraryBig,
  LogOut,
  Pencil,
  ShieldCheck,
  UserCog,
  UserRoundPlus,
  Users,
} from 'lucide-react'
import './App.css'
import UserManagement from './features/admin/UserManagement.jsx'

const BASE_URL = 'http://localhost:8080/api'
const ROLE_MAP = {
  ADMIN: { label: 'Admin', icon: ShieldCheck },
  FACULTY: { label: 'Faculty', icon: GraduationCap },
  STUDENT: { label: 'Student', icon: Users },
  LIBRARIAN: { label: 'Librarian', icon: LibraryBig },
}

const roleFromToken = (value) => value?.replace(/^ROLE_/, '').toUpperCase()

const buildApiClient = (username, password) =>
  axios.create({
    baseURL: BASE_URL,
    auth: username && password ? { username, password } : undefined,
    headers: {
      'Content-Type': 'application/json',
    },
  })

const dashboards = {
  ADMIN: {
    title: 'Administrative Dashboard',
    summary: 'Manage user accounts and institutional records.',
  },
  FACULTY: {
    title: 'Faculty Dashboard',
    summary: 'Manage assigned classes, attendance, and assignments.',
  },
  STUDENT: {
    title: 'Student Dashboard',
    summary: 'View academic records, assignments, attendance, and fees.',
  },
  LIBRARIAN: {
    title: 'Library Dashboard',
    summary: 'Manage the library catalogue and circulation records.',
  },
}

function App() {
  const [session, setSession] = useState(null)
  const [apiClient, setApiClient] = useState(null)

  useEffect(() => {
    localStorage.removeItem('ims-session')
  }, [])

  const handleLogin = async ({ username, password }) => {
    const client = buildApiClient(username, password)

    try {
      const response = await client.post('/auth/login', { username, password })
      const roleTokens = Array.isArray(response.data.roles) ? response.data.roles : []
      const primaryRole = roleTokens
        .map(roleFromToken)
        .find((role) => Object.hasOwn(ROLE_MAP, role))

      const nextSession = {
        username,
        primaryRole: primaryRole || 'STUDENT',
        roleTokens,
      }

      setApiClient(client)
      setSession(nextSession)
      return nextSession
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Incorrect username or password.')
      }

      if (error.response) {
        throw new Error(error.response.data?.message || `Login failed (HTTP ${error.response.status}).`)
      }

      throw new Error('Unable to connect to the IMS backend. Make sure the Spring Boot server is running.')
    }
  }

  const handleLogout = () => {
    setSession(null)
    setApiClient(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/admin/students"
          element={
            <ProtectedDashboard
              session={session}
              apiClient={apiClient}
              onLogout={handleLogout}
              roleOverride="ADMIN"
              page="students"
            />
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedDashboard
              session={session}
              apiClient={apiClient}
              onLogout={handleLogout}
              roleOverride="ADMIN"
              page="users"
            />
          }
        />
        <Route
          path="/:role"
          element={
            <ProtectedDashboard
              session={session}
              apiClient={apiClient}
              onLogout={handleLogout}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const session = await onLogin(form)
      const role = (session?.primaryRole || 'ADMIN').toLowerCase()
      navigate(`/${role}`)
    } catch (loginError) {
      setError(loginError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand-block">
          <div className="brand-mark">IMS</div>
          <div>
            <p className="eyebrow">Institute Management System</p>
            <h1>Role-based academic operations</h1>
          </div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            />
          </div>

          <div className="field-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            />
          </div>

          {error ? <p className="error-message">{error}</p> : null}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

      </div>
    </div>
  )
}

function ProtectedDashboard({ session, apiClient, onLogout, roleOverride, page }) {
  const { role } = useParams()
  const navigate = useNavigate()
  const normalizedRole = (roleOverride || role || '').toUpperCase()

  useEffect(() => {
    if (!session) {
      navigate('/')
      return
    }

    if (session.primaryRole !== normalizedRole) {
      navigate(`/${session.primaryRole.toLowerCase()}`)
    }
  }, [navigate, normalizedRole, session])

  const currentRole = session?.primaryRole || normalizedRole
  const dashboard = useMemo(
    () => dashboards[currentRole] || {
      title: `${ROLE_MAP[currentRole]?.label || 'Dashboard'} Overview`,
      summary: 'View your account and assigned institute records.',
    },
    [currentRole],
  )
  const roleMeta = ROLE_MAP[currentRole] || ROLE_MAP.ADMIN
  const Icon = roleMeta.icon

  if (!session) return <Navigate to="/" replace />

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="profile-block">
          <div className="avatar">{session.username.slice(0, 2).toUpperCase()}</div>
          <div>
            <p className="eyebrow">Logged in as</p>
            <strong>{session.username}</strong>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Modules">
          {currentRole === 'ADMIN' ? (
            <>
              <button
                type="button"
                className={page === 'students' ? 'nav-item active' : 'nav-item'}
                onClick={() => navigate('/admin/students')}
              >
                <Users size={16} />
                Students
              </button>
              <button
                type="button"
                className={page === 'users' ? 'nav-item active' : 'nav-item'}
                onClick={() => navigate('/admin/users')}
              >
                <UserCog size={16} />
                Users
              </button>
            </>
          ) : (
            <p className="sidebar-empty">Modules are being added.</p>
          )}
        </nav>

        <button type="button" className="logout-button" onClick={() => { onLogout(); navigate('/'); }}>
          <LogOut size={16} />
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">{roleMeta.label}</p>
            <h2>
              {page === 'students'
                ? 'Student Management'
                : page === 'users'
                  ? 'User Management'
                  : dashboard.title}
            </h2>
          </div>
          <div className="role-pill">
            <Icon size={16} />
            {roleMeta.label}
          </div>
        </header>

        {page === 'students' ? (
          <StudentManagement apiClient={apiClient} />
        ) : page === 'users' ? (
          <UserManagement apiClient={apiClient} currentUsername={session.username} />
        ) : (
          <>
            <section className="hero-panel">
              <div>
                <p className="eyebrow">Overview</p>
                <h3>{dashboard.summary}</h3>
              </div>
              {currentRole === 'ADMIN' ? (
                <button type="button" className="secondary-button" onClick={() => navigate('/admin/students')}>
                  Manage students
                  <ArrowRight size={16} />
                </button>
              ) : null}
            </section>

            <section className="content-grid">
              <article className="panel-card">
                <h3>Modules</h3>
                <p>
                  {currentRole === 'ADMIN'
                    ? 'Student Management is available. Other institute workflows are still being built.'
                    : 'This dashboard is a starting point. Role-specific workflows are still being built.'}
                </p>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function StudentManagement({ apiClient }) {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState(emptyStudentForm)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/admin/students')
      .then((response) => {
        if (isCurrent) {
          setStudents(response.data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(getRequestError(requestError, 'Could not load student records.'))
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

  const filteredStudents = students.filter((student) =>
    [
      student.studentNumber,
      student.firstName,
      student.lastName,
      student.department,
      student.className,
      student.accountUsername,
    ].some((value) => value?.toLowerCase().includes(filter.trim().toLowerCase())),
  )
  const activeCount = students.filter((student) => student.active).length
  const accountCount = students.filter((student) => student.accountUsername).length

  const openCreateForm = () => {
    setEditingStudent(null)
    setForm(emptyStudentForm())
    setFormError('')
    setFormOpen(true)
  }

  const openEditForm = (student) => {
    setEditingStudent(student)
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
    })
    setFormError('')
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingStudent(null)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    const accountDetails = [form.username.trim(), form.password, form.email.trim()]
    const hasAccountDetails = accountDetails.some(Boolean)
    if (!editingStudent && hasAccountDetails && accountDetails.some((value) => !value)) {
      setFormError('To create a student login, enter a username, password, and email.')
      return
    }
    if (!editingStudent && hasAccountDetails && (form.password.length < 12 || form.password.length > 72)) {
      setFormError('Student login passwords must be between 12 and 72 characters.')
      return
    }

    const studentDetails = {
      studentNumber: form.studentNumber.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      department: form.department.trim(),
      year: form.year.trim(),
      className: form.className.trim(),
    }

    setIsSaving(true)
    try {
      if (editingStudent) {
        await apiClient.put(`/admin/students/${editingStudent.id}`, studentDetails)
      } else {
        await apiClient.post('/admin/students', {
          ...studentDetails,
          username: form.username.trim() || null,
          password: form.password || null,
          email: form.email.trim() || null,
        })
      }
      closeForm()
      setIsLoading(true)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setFormError(getRequestError(requestError, 'Could not save this student.'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (student) => {
    const nextActive = !student.active
    if (!nextActive && !window.confirm(`Deactivate ${student.firstName} ${student.lastName}? Their linked login will also be disabled; their records will be preserved.`)) {
      return
    }
    setError('')
    try {
      await apiClient.put(`/admin/students/${student.id}/status`, { active: nextActive })
      setIsLoading(true)
      setRefreshKey((current) => current + 1)
    } catch (requestError) {
      setError(getRequestError(requestError, 'Could not update the student status.'))
    }
  }

  return (
    <section className="student-management">
      <div className="students-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h3>Student Management</h3>
          <p className="section-description">Create and maintain student records and optional login accounts.</p>
        </div>
        <button type="button" className="primary-button add-student-button" onClick={openCreateForm}>
          <UserRoundPlus size={17} />
          Add student
        </button>
      </div>

      <div className="student-stats">
        <article className="metric-card">
          <span>Total students</span>
          <strong>{students.length}</strong>
        </article>
        <article className="metric-card">
          <span>Active students</span>
          <strong>{activeCount}</strong>
        </article>
        <article className="metric-card">
          <span>Login accounts</span>
          <strong>{accountCount}</strong>
        </article>
      </div>

      {error ? <p className="error-message student-error" role="alert">{error}</p> : null}

      {formOpen ? (
        <form className="panel-card student-form" onSubmit={handleSubmit}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">{editingStudent ? 'Edit record' : 'New record'}</p>
              <h4>{editingStudent ? 'Update student details' : 'Add a student'}</h4>
            </div>
            <button type="button" className="text-button" onClick={closeForm}>Cancel</button>
          </div>

          <div className="student-fields">
            <StudentField label="Student number" name="studentNumber" value={form.studentNumber} onChange={setForm} required />
            <StudentField label="First name" name="firstName" value={form.firstName} onChange={setForm} required />
            <StudentField label="Last name" name="lastName" value={form.lastName} onChange={setForm} required />
            <StudentField label="Department" name="department" value={form.department} onChange={setForm} required />
            <StudentField label="Year" name="year" value={form.year} onChange={setForm} placeholder="e.g. 1st year" required />
            <StudentField label="Class" name="className" value={form.className} onChange={setForm} required />
          </div>

          {!editingStudent ? (
            <div className="account-fields">
              <div>
                <h4>Student login (optional)</h4>
                <p>Leave all three blank to create a record without a login.</p>
              </div>
              <div className="student-fields">
                <StudentField label="Username" name="username" value={form.username} onChange={setForm} autoComplete="off" />
                <StudentField label="Temporary password" name="password" type="password" value={form.password} onChange={setForm} minLength={12} maxLength={72} autoComplete="new-password" />
                <StudentField label="Email" name="email" type="email" value={form.email} onChange={setForm} autoComplete="email" />
              </div>
            </div>
          ) : null}

          {formError ? <p className="error-message" role="alert">{formError}</p> : null}
          <div className="form-actions">
            <button type="button" className="text-button" onClick={closeForm}>Cancel</button>
            <button type="submit" className="primary-button save-student-button" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingStudent ? 'Save changes' : 'Create student'}
            </button>
          </div>
        </form>
      ) : null}

      <section className="panel-card student-records">
        <div className="records-toolbar">
          <div>
            <h4>Student records</h4>
            <p>{filteredStudents.length} record{filteredStudents.length === 1 ? '' : 's'}</p>
          </div>
          <input
            type="search"
            aria-label="Search students"
            placeholder="Search students..."
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
        </div>

        {isLoading ? (
          <p className="empty-state">Loading student records...</p>
        ) : filteredStudents.length === 0 ? (
          <p className="empty-state">{students.length ? 'No students match your search.' : 'No student records yet. Add the first student above.'}</p>
        ) : (
          <div className="student-table-wrap">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Year / Class</th>
                  <th>Login</th>
                  <th>Status</th>
                  <th><span className="visually-hidden">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <strong>{student.firstName} {student.lastName}</strong>
                      <span>{student.studentNumber}</span>
                    </td>
                    <td>{student.department}</td>
                    <td>{student.year}<span>{student.className}</span></td>
                    <td>{student.accountUsername || <span className="muted-text">Not created</span>}</td>
                    <td>
                      <span className={student.active ? 'status-badge active' : 'status-badge inactive'}>
                        {student.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="student-actions">
                        <button type="button" className="icon-button" aria-label={`Edit ${student.firstName} ${student.lastName}`} onClick={() => openEditForm(student)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" className="text-button" onClick={() => handleStatusChange(student)}>
                          {student.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  )
}

function StudentField({ label, name, value, onChange, ...inputProps }) {
  return (
    <div className="field-row">
      <label htmlFor={`student-${name}`}>{label}</label>
      <input
        id={`student-${name}`}
        name={name}
        value={value}
        onChange={(event) => onChange((current) => ({ ...current, [name]: event.target.value }))}
        {...inputProps}
      />
    </div>
  )
}

function emptyStudentForm() {
  return {
    studentNumber: '',
    firstName: '',
    lastName: '',
    department: '',
    year: '',
    className: '',
    username: '',
    password: '',
    email: '',
  }
}

function getRequestError(error, fallback) {
  if (error.response) {
    return error.response.data?.message || `${fallback} (HTTP ${error.response.status}).`
  }
  return `${fallback} Check that the backend is running.`
}

export default App
