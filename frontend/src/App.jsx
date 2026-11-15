import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowRight,
  GraduationCap,
  LibraryBig,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react'
import './App.css'

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

  useEffect(() => {
    localStorage.removeItem('ims-session')
  }, [])

  const handleLogin = async ({ username, password }) => {
    const client = buildApiClient(username, password)

    try {
      const formData = new URLSearchParams({ username, password })
      const response = await client.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      const roleTokens = Array.isArray(response.data.roles) ? response.data.roles : []
      const primaryRole = roleTokens
        .map(roleFromToken)
        .find((role) => Object.hasOwn(ROLE_MAP, role))

      const nextSession = {
        username,
        primaryRole: primaryRole || 'STUDENT',
        roleTokens,
      }

      setSession(nextSession)
      return nextSession
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('Incorrect username or password.')
      }

      throw new Error('Unable to connect to the IMS backend. Make sure the Spring Boot server is running.')
    }
  }

  const handleLogout = () => {
    setSession(null)
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/:role"
          element={
            <ProtectedDashboard
              session={session}
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

function ProtectedDashboard({ session, onLogout }) {
  const { role } = useParams()
  const navigate = useNavigate()
  const normalizedRole = (role || '').toUpperCase()

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

        <nav className="sidebar-nav">
          {Object.entries(ROLE_MAP).map(([key, value]) => {
            const active = key === currentRole
            const NavIcon = value.icon
            return (
              <button
                key={key}
                type="button"
                className={active ? 'nav-item active' : 'nav-item'}
                onClick={() => navigate(`/${key.toLowerCase()}`)}
              >
                <NavIcon size={16} />
                {value.label}
              </button>
            )
          })}
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
            <h2>{dashboard.title}</h2>
          </div>
          <div className="role-pill">
            <Icon size={16} />
            {roleMeta.label}
          </div>
        </header>

        <section className="hero-panel">
          <div>
            <p className="eyebrow">Overview</p>
            <h3>{dashboard.summary}</h3>
          </div>
          <button type="button" className="secondary-button">
            Explore modules
            <ArrowRight size={16} />
          </button>
        </section>

        <section className="content-grid">
          <article className="panel-card">
            <h3>Module data</h3>
            <p>Live records will appear here as the academic and administrative modules are connected.</p>
          </article>
        </section>
      </main>
    </div>
  )
}

export default App
