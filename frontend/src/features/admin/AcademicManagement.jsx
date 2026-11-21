import { useEffect, useState } from 'react'
import './AcademicManagement.css'

function AcademicManagement({ apiClient }) {
  const [data, setData] = useState({ departments: [], terms: [], classes: [], subjects: [], enrolments: [], offerings: [] })
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [activeSection, setActiveSection] = useState('departments')
  const [forms, setForms] = useState({
    department: { code: '', name: '' },
    term: { name: '', startDate: '', endDate: '' },
    subject: { code: '', name: '', department: '', credits: 3, semester: '' },
    class: { code: '', name: '', departmentId: '', termId: '', crStudentId: '' },
    enrolment: { studentId: '', academicClassId: '' },
    offering: { subjectId: '', academicClassId: '', facultyId: '' },
  })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const [academicResponse, studentResponse, facultyResponse] = await Promise.all([
        apiClient.get('/admin/academic'),
        apiClient.get('/admin/students'),
        apiClient.get('/admin/faculty'),
      ])
      setData(academicResponse.data)
      setStudents(studentResponse.data)
      setFaculty(facultyResponse.data)
      setError('')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load academic records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isCurrent = true
    Promise.all([
      apiClient.get('/admin/academic'),
      apiClient.get('/admin/students'),
      apiClient.get('/admin/faculty'),
    ]).then(([academicResponse, studentResponse, facultyResponse]) => {
      if (isCurrent) {
        setData(academicResponse.data)
        setStudents(studentResponse.data)
        setFaculty(facultyResponse.data)
        setLoading(false)
      }
    }).catch((requestError) => {
      if (isCurrent) {
        setError(requestError.response?.data?.message || 'Could not load academic records.')
        setLoading(false)
      }
    })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const updateForm = (section, field, value) => {
    setForms((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }))
  }

  const create = async (section, path, payload) => {
    setError('')
    setNotice('')
    try {
      await apiClient.post(`/admin/academic/${path}`, payload)
      setNotice(`${section} created successfully.`)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Could not create ${section}.`)
    }
  }

  const submitSection = (event, section) => {
    event.preventDefault()
    if (section === 'department') return create('Department', 'departments', forms.department)
    if (section === 'term') return create('Academic term', 'terms', forms.term)
    if (section === 'subject') return create('Subject', 'subjects', {
      ...forms.subject,
      credits: Number(forms.subject.credits),
    })
    if (section === 'class') return create('Class', 'classes', {
      ...forms.class,
      departmentId: Number(forms.class.departmentId),
      termId: Number(forms.class.termId),
      crStudentId: forms.class.crStudentId ? Number(forms.class.crStudentId) : null,
    })
    if (section === 'enrolment') return create('Enrolment', 'enrolments', {
      studentId: Number(forms.enrolment.studentId),
      academicClassId: Number(forms.enrolment.academicClassId),
    })
    return create('Subject offering', 'offerings', {
      subjectId: Number(forms.offering.subjectId),
      academicClassId: Number(forms.offering.academicClassId),
      facultyId: forms.offering.facultyId ? Number(forms.offering.facultyId) : null,
    })
  }

  const sections = [
    ['departments', 'Departments'],
    ['terms', 'Terms'],
    ['subjects', 'Subjects'],
    ['classes', 'Classes'],
    ['enrolments', 'Enrolments'],
    ['offerings', 'Offerings'],
  ]

  return (
    <section className="academic-management">
      <div className="academic-header">
        <div>
          <p className="eyebrow">Administration</p>
          <h3>Academic Structure</h3>
          <p className="section-description">Configure departments, terms, classes, subjects, enrolments, and subject offerings.</p>
        </div>
      </div>

      <div className="academic-stats">
        <article className="metric-card"><span>Departments</span><strong>{data.departments.length}</strong></article>
        <article className="metric-card"><span>Classes</span><strong>{data.classes.length}</strong></article>
        <article className="metric-card"><span>Subjects</span><strong>{data.subjects.length}</strong></article>
        <article className="metric-card"><span>Enrolments</span><strong>{data.enrolments.length}</strong></article>
      </div>

      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {notice ? <p className="success-message" role="status">{notice}</p> : null}

      <div className="academic-tabs" role="tablist">
        {sections.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={activeSection === key ? 'academic-tab active' : 'academic-tab'}
            onClick={() => setActiveSection(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="academic-grid">
        {activeSection === 'departments' ? (
          <form className="panel-card academic-form" onSubmit={(event) => submitSection(event, 'department')}>
            <h4>Create department</h4>
            <Field label="Code" value={forms.department.code} onChange={(value) => updateForm('department', 'code', value)} />
            <Field label="Name" value={forms.department.name} onChange={(value) => updateForm('department', 'name', value)} />
            <button className="primary-button" type="submit">Create department</button>
            <RecordList items={data.departments} label={(item) => `${item.code} - ${item.name}`} />
          </form>
        ) : null}

        {activeSection === 'terms' ? (
          <form className="panel-card academic-form" onSubmit={(event) => submitSection(event, 'term')}>
            <h4>Create academic term</h4>
            <Field label="Name" value={forms.term.name} onChange={(value) => updateForm('term', 'name', value)} />
            <Field label="Start date" type="date" value={forms.term.startDate} onChange={(value) => updateForm('term', 'startDate', value)} />
            <Field label="End date" type="date" value={forms.term.endDate} onChange={(value) => updateForm('term', 'endDate', value)} />
            <button className="primary-button" type="submit">Create term</button>
            <RecordList items={data.terms} label={(item) => `${item.name} (${item.startDate} to ${item.endDate})`} />
          </form>
        ) : null}

        {activeSection === 'subjects' ? (
          <form className="panel-card academic-form" onSubmit={(event) => submitSection(event, 'subject')}>
            <h4>Create subject</h4>
            <Field label="Code" value={forms.subject.code} onChange={(value) => updateForm('subject', 'code', value)} />
            <Field label="Name" value={forms.subject.name} onChange={(value) => updateForm('subject', 'name', value)} />
            <Field label="Department" value={forms.subject.department} onChange={(value) => updateForm('subject', 'department', value)} />
            <Field label="Semester" value={forms.subject.semester} onChange={(value) => updateForm('subject', 'semester', value)} />
            <Field label="Credits" type="number" value={forms.subject.credits} onChange={(value) => updateForm('subject', 'credits', value)} />
            <button className="primary-button" type="submit">Create subject</button>
            <RecordList items={data.subjects} label={(item) => `${item.code} - ${item.name} (${item.credits} credits)`} />
          </form>
        ) : null}

        {activeSection === 'classes' ? (
          <form className="panel-card academic-form" onSubmit={(event) => submitSection(event, 'class')}>
            <h4>Create class</h4>
            <Field label="Code" value={forms.class.code} onChange={(value) => updateForm('class', 'code', value)} />
            <Field label="Name" value={forms.class.name} onChange={(value) => updateForm('class', 'name', value)} />
            <SelectField label="Department" value={forms.class.departmentId} onChange={(value) => updateForm('class', 'departmentId', value)} options={data.departments.map((item) => [item.id, item.name])} />
            <SelectField label="Term" value={forms.class.termId} onChange={(value) => updateForm('class', 'termId', value)} options={data.terms.map((item) => [item.id, item.name])} />
            <SelectField label="Class Representative" value={forms.class.crStudentId} onChange={(value) => updateForm('class', 'crStudentId', value)} options={students.map((item) => [item.id, `${item.firstName} ${item.lastName}`])} />
            <button className="primary-button" type="submit" disabled={!data.departments.length || !data.terms.length}>Create class</button>
            <RecordList items={data.classes} label={(item) => `${item.code} - ${item.name} (${item.termName})`} />
          </form>
        ) : null}

        {activeSection === 'enrolments' ? (
          <form className="panel-card academic-form" onSubmit={(event) => submitSection(event, 'enrolment')}>
            <h4>Enroll student</h4>
            <SelectField label="Student" value={forms.enrolment.studentId} onChange={(value) => updateForm('enrolment', 'studentId', value)} options={students.map((item) => [item.id, `${item.firstName} ${item.lastName} (${item.studentNumber})`])} />
            <SelectField label="Class" value={forms.enrolment.academicClassId} onChange={(value) => updateForm('enrolment', 'academicClassId', value)} options={data.classes.map((item) => [item.id, item.name])} />
            <button className="primary-button" type="submit" disabled={!students.length || !data.classes.length}>Create enrolment</button>
            <RecordList items={data.enrolments} label={(item) => `${item.studentName} - ${item.academicClassName}`} />
          </form>
        ) : null}

        {activeSection === 'offerings' ? (
          <form className="panel-card academic-form" onSubmit={(event) => submitSection(event, 'offering')}>
            <h4>Create subject offering</h4>
            <SelectField label="Subject" value={forms.offering.subjectId} onChange={(value) => updateForm('offering', 'subjectId', value)} options={data.subjects.map((item) => [item.id, item.name])} />
            <SelectField label="Class" value={forms.offering.academicClassId} onChange={(value) => updateForm('offering', 'academicClassId', value)} options={data.classes.map((item) => [item.id, item.name])} />
            <SelectField label="Faculty" value={forms.offering.facultyId} onChange={(value) => updateForm('offering', 'facultyId', value)} options={faculty.map((item) => [item.id, `${item.firstName} ${item.lastName}`])} />
            <button className="primary-button" type="submit" disabled={!data.subjects.length || !data.classes.length}>Create offering</button>
            <RecordList items={data.offerings} label={(item) => `${item.subjectName} - ${item.academicClassName}${item.facultyName ? ` (${item.facultyName})` : ''}`} />
          </form>
        ) : null}
      </div>
      {loading ? <p className="empty-state">Loading academic records...</p> : null}
    </section>
  )
}

function Field({ label, type = 'text', value, onChange }) {
  return (
    <div className="academic-field">
      <label>{label}</label>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="academic-field">
      <label>{label}</label>
      <select value={value} onChange={(event) => onChange(event.target.value)} required={label !== 'Faculty'}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </div>
  )
}

function RecordList({ items, label }) {
  return (
    <div className="academic-record-list">
      {items.length ? items.map((item) => <div key={item.id}>{label(item)}</div>) : <p className="empty-state">No records yet.</p>}
    </div>
  )
}

export default AcademicManagement
