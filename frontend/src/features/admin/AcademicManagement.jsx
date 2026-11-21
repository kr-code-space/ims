import React, { useEffect, useState, useMemo } from 'react';
import {
  BookOpenCheck,
  Building,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import tableStyles from '../../styles/DataTable.module.css';

export default function AcademicManagement({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [data, setData] = useState({
    departments: [],
    terms: [],
    classes: [],
    subjects: [],
    enrolments: [],
    offerings: [],
  });
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [activeSection, setActiveSection] = useState('departments');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [forms, setForms] = useState({
    department: { code: '', name: '' },
    term: { name: '', startDate: '', endDate: '' },
    subject: { code: '', name: '', department: '', credits: 3, semester: '' },
    class: { code: '', name: '', departmentId: '', termId: '', crStudentId: '' },
    enrolment: { studentId: '', academicClassId: '' },
    offering: { subjectId: '', academicClassId: '', facultyId: '' },
  });

  const loadData = async () => {
    try {
      const [academicRes, studentRes, facultyRes] = await Promise.all([
        apiClient.get('/admin/academic'),
        apiClient.get('/admin/students'),
        apiClient.get('/admin/faculty'),
      ]);
      setData(academicRes.data || { departments: [], terms: [], classes: [], subjects: [], enrolments: [], offerings: [] });
      setStudents(studentRes.data || []);
      setFaculty(facultyRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load academic records.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiClient]);

  const updateForm = (section, field, value) => {
    setForms((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  };

  const createRecord = async (sectionLabel, path, payload, resetFormKey, defaultForm) => {
    setIsSubmitting(true);
    try {
      await apiClient.post(`/admin/academic/${path}`, payload);
      showToast(`${sectionLabel} created successfully.`, 'success');
      setForms((prev) => ({ ...prev, [resetFormKey]: defaultForm }));
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || `Could not create ${sectionLabel}.`;
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSection = (e, section) => {
    e.preventDefault();
    if (section === 'department') {
      return createRecord('Department', 'departments', forms.department, 'department', { code: '', name: '' });
    }
    if (section === 'term') {
      return createRecord('Academic Term', 'terms', forms.term, 'term', { name: '', startDate: '', endDate: '' });
    }
    if (section === 'subject') {
      return createRecord('Subject', 'subjects', {
        ...forms.subject,
        credits: Number(forms.subject.credits),
      }, 'subject', { code: '', name: '', department: '', credits: 3, semester: '' });
    }
    if (section === 'class') {
      return createRecord('Class', 'classes', {
        ...forms.class,
        departmentId: Number(forms.class.departmentId),
        termId: Number(forms.class.termId),
        crStudentId: forms.class.crStudentId ? Number(forms.class.crStudentId) : null,
      }, 'class', { code: '', name: '', departmentId: '', termId: '', crStudentId: '' });
    }
    if (section === 'enrolment') {
      return createRecord('Student Enrolment', 'enrolments', {
        studentId: Number(forms.enrolment.studentId),
        academicClassId: Number(forms.enrolment.academicClassId),
      }, 'enrolment', { studentId: '', academicClassId: '' });
    }
    return createRecord('Subject Offering', 'offerings', {
      subjectId: Number(forms.offering.subjectId),
      academicClassId: Number(forms.offering.academicClassId),
      facultyId: forms.offering.facultyId ? Number(forms.offering.facultyId) : null,
    }, 'offering', { subjectId: '', academicClassId: '', facultyId: '' });
  };

  const tabs = [
    { key: 'departments', label: 'Departments', count: data.departments.length, icon: Building },
    { key: 'terms', label: 'Academic Terms', count: data.terms.length, icon: Calendar },
    { key: 'classes', label: 'Class Sections', count: data.classes.length, icon: Layers },
    { key: 'subjects', label: 'Subjects / Courses', count: data.subjects.length, icon: BookOpen },
    { key: 'enrolments', label: 'Student Enrolments', count: data.enrolments.length, icon: Users },
    { key: 'offerings', label: 'Faculty Offerings', count: data.offerings.length, icon: GraduationCap },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Academic Setup"
        title="Academic Structure & Offerings"
        description="Configure university departments, terms, class cohorts, subjects, student enrolments, and faculty allocations."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Departments" value={data.departments.length} icon={Building} color="primary" />
        <StatCard label="Academic Terms" value={data.terms.length} icon={Calendar} color="info" />
        <StatCard label="Classes" value={data.classes.length} icon={Layers} color="success" />
        <StatCard label="Active Offerings" value={data.offerings.length} icon={GraduationCap} color="warning" />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px',
          marginBottom: '24px',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.88rem',
                border: '1px solid',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span
                style={{
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.72rem',
                  backgroundColor: isActive ? 'var(--primary)' : 'var(--bg-hover)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content for Active Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
        {/* Creation Form Panel */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            alignSelf: 'start',
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Add {tabs.find((t) => t.key === activeSection)?.label.slice(0, -1) || 'Record'}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Fill details to persist in the academic database.
            </p>
          </div>

          {activeSection === 'departments' && (
            <form onSubmit={(e) => submitSection(e, 'department')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Department Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CSE"
                  value={forms.department.code}
                  onChange={(e) => updateForm('department', 'code', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Department Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  value={forms.department.name}
                  onChange={(e) => updateForm('department', 'name', e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: '8px' }}>
                <Plus size={16} />
                <span>{isSubmitting ? 'Creating...' : 'Create Department'}</span>
              </button>
            </form>
          )}

          {activeSection === 'terms' && (
            <form onSubmit={(e) => submitSection(e, 'term')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Term Name / Session *</label>
                <input
                  type="text"
                  placeholder="e.g. Fall 2026, Semester 1"
                  value={forms.term.name}
                  onChange={(e) => updateForm('term', 'name', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Start Date *</label>
                  <input
                    type="date"
                    value={forms.term.startDate}
                    onChange={(e) => updateForm('term', 'startDate', e.target.value)}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>End Date *</label>
                  <input
                    type="date"
                    value={forms.term.endDate}
                    onChange={(e) => updateForm('term', 'endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: '8px' }}>
                <Plus size={16} />
                <span>{isSubmitting ? 'Creating...' : 'Create Term'}</span>
              </button>
            </form>
          )}

          {activeSection === 'subjects' && (
            <form onSubmit={(e) => submitSection(e, 'subject')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Subject Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CS301"
                  value={forms.subject.code}
                  onChange={(e) => updateForm('subject', 'code', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Subject Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Operating Systems"
                  value={forms.subject.name}
                  onChange={(e) => updateForm('subject', 'name', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Department *</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={forms.subject.department}
                  onChange={(e) => updateForm('subject', 'department', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Semester</label>
                  <input
                    type="text"
                    placeholder="e.g. Sem 3"
                    value={forms.subject.semester}
                    onChange={(e) => updateForm('subject', 'semester', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Credits *</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={forms.subject.credits}
                    onChange={(e) => updateForm('subject', 'credits', e.target.value)}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ marginTop: '8px' }}>
                <Plus size={16} />
                <span>{isSubmitting ? 'Creating...' : 'Create Subject'}</span>
              </button>
            </form>
          )}

          {activeSection === 'classes' && (
            <form onSubmit={(e) => submitSection(e, 'class')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Class Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CSE-A-2026"
                  value={forms.class.code}
                  onChange={(e) => updateForm('class', 'code', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Class Name *</label>
                <input
                  type="text"
                  placeholder="e.g. CSE Year 3 Section A"
                  value={forms.class.name}
                  onChange={(e) => updateForm('class', 'name', e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Department *</label>
                <select
                  value={forms.class.departmentId}
                  onChange={(e) => updateForm('class', 'departmentId', e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {data.departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.code} - {d.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Academic Term *</label>
                <select
                  value={forms.class.termId}
                  onChange={(e) => updateForm('class', 'termId', e.target.value)}
                  required
                >
                  <option value="">Select Term</option>
                  {data.terms.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Class Representative (Student)</label>
                <select
                  value={forms.class.crStudentId}
                  onChange={(e) => updateForm('class', 'crStudentId', e.target.value)}
                >
                  <option value="">Optional (None)</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentNumber})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !data.departments.length || !data.terms.length}
                style={{ marginTop: '8px' }}
              >
                <Plus size={16} />
                <span>{isSubmitting ? 'Creating...' : 'Create Class'}</span>
              </button>
            </form>
          )}

          {activeSection === 'enrolments' && (
            <form onSubmit={(e) => submitSection(e, 'enrolment')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Student *</label>
                <select
                  value={forms.enrolment.studentId}
                  onChange={(e) => updateForm('enrolment', 'studentId', e.target.value)}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentNumber})</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Class Section *</label>
                <select
                  value={forms.enrolment.academicClassId}
                  onChange={(e) => updateForm('enrolment', 'academicClassId', e.target.value)}
                  required
                >
                  <option value="">Select Class</option>
                  {data.classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !students.length || !data.classes.length}
                style={{ marginTop: '8px' }}
              >
                <Plus size={16} />
                <span>{isSubmitting ? 'Enrolling...' : 'Enroll Student'}</span>
              </button>
            </form>
          )}

          {activeSection === 'offerings' && (
            <form onSubmit={(e) => submitSection(e, 'offering')} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Subject *</label>
                <select
                  value={forms.offering.subjectId}
                  onChange={(e) => updateForm('offering', 'subjectId', e.target.value)}
                  required
                >
                  <option value="">Select Subject</option>
                  {data.subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.code} - {sub.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Class Section *</label>
                <select
                  value={forms.offering.academicClassId}
                  onChange={(e) => updateForm('offering', 'academicClassId', e.target.value)}
                  required
                >
                  <option value="">Select Class</option>
                  {data.classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Allocated Faculty (Optional)</label>
                <select
                  value={forms.offering.facultyId}
                  onChange={(e) => updateForm('offering', 'facultyId', e.target.value)}
                >
                  <option value="">None (Unallocated)</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>{f.firstName} {f.lastName} ({f.department})</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || !data.subjects.length || !data.classes.length}
                style={{ marginTop: '8px' }}
              >
                <Plus size={16} />
                <span>{isSubmitting ? 'Creating...' : 'Create Offering'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Directory Table Panel */}
        <div className={tableStyles.container}>
          <div className={tableStyles.toolbar}>
            <div className={tableStyles.summary}>
              <span className={tableStyles.summaryTitle}>
                {tabs.find((t) => t.key === activeSection)?.label} Records
              </span>
              <span className={tableStyles.summaryCount}>
                Active records in system
              </span>
            </div>
          </div>

          <div className={tableStyles.tableWrap}>
            <table className={tableStyles.table}>
              {activeSection === 'departments' && (
                <>
                  <thead>
                    <tr><th>Code</th><th>Department Name</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.departments.length === 0 ? (
                      <tr><td colSpan={3} className={tableStyles.emptyState}>No departments added yet.</td></tr>
                    ) : (
                      data.departments.map((d) => (
                        <tr key={d.id}>
                          <td><span className="badge badge-primary">{d.code}</span></td>
                          <td><span className={tableStyles.cellPrimary}>{d.name}</span></td>
                          <td><span className="badge badge-success">Active</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {activeSection === 'terms' && (
                <>
                  <thead>
                    <tr><th>Term Name</th><th>Duration</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {data.terms.length === 0 ? (
                      <tr><td colSpan={3} className={tableStyles.emptyState}>No terms defined yet.</td></tr>
                    ) : (
                      data.terms.map((t) => (
                        <tr key={t.id}>
                          <td><span className={tableStyles.cellPrimary}>{t.name}</span></td>
                          <td>{t.startDate} to {t.endDate}</td>
                          <td><span className="badge badge-success">Active</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {activeSection === 'subjects' && (
                <>
                  <thead>
                    <tr><th>Code</th><th>Subject Name</th><th>Dept</th><th>Credits</th></tr>
                  </thead>
                  <tbody>
                    {data.subjects.length === 0 ? (
                      <tr><td colSpan={4} className={tableStyles.emptyState}>No subjects defined yet.</td></tr>
                    ) : (
                      data.subjects.map((s) => (
                        <tr key={s.id}>
                          <td><span className="badge badge-primary">{s.code}</span></td>
                          <td><span className={tableStyles.cellPrimary}>{s.name}</span></td>
                          <td>{s.department}</td>
                          <td>{s.credits} cr</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {activeSection === 'classes' && (
                <>
                  <thead>
                    <tr><th>Code</th><th>Class Name</th><th>Term</th><th>CR Student</th></tr>
                  </thead>
                  <tbody>
                    {data.classes.length === 0 ? (
                      <tr><td colSpan={4} className={tableStyles.emptyState}>No classes created yet.</td></tr>
                    ) : (
                      data.classes.map((c) => (
                        <tr key={c.id}>
                          <td><span className="badge badge-primary">{c.code}</span></td>
                          <td><span className={tableStyles.cellPrimary}>{c.name}</span></td>
                          <td>{c.termName}</td>
                          <td>{c.crStudentName || <span style={{ color: 'var(--text-muted)' }}>None</span>}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {activeSection === 'enrolments' && (
                <>
                  <thead>
                    <tr><th>Student</th><th>Class Section</th></tr>
                  </thead>
                  <tbody>
                    {data.enrolments.length === 0 ? (
                      <tr><td colSpan={2} className={tableStyles.emptyState}>No students enrolled yet.</td></tr>
                    ) : (
                      data.enrolments.map((en) => (
                        <tr key={en.id}>
                          <td><span className={tableStyles.cellPrimary}>{en.studentName}</span></td>
                          <td><span className="badge badge-primary">{en.academicClassName}</span></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}

              {activeSection === 'offerings' && (
                <>
                  <thead>
                    <tr><th>Subject</th><th>Class Section</th><th>Assigned Faculty</th></tr>
                  </thead>
                  <tbody>
                    {data.offerings.length === 0 ? (
                      <tr><td colSpan={3} className={tableStyles.emptyState}>No offerings configured yet.</td></tr>
                    ) : (
                      data.offerings.map((off) => (
                        <tr key={off.id}>
                          <td><span className={tableStyles.cellPrimary}>{off.subjectName}</span></td>
                          <td><span className="badge badge-primary">{off.academicClassName}</span></td>
                          <td>
                            {off.facultyName ? (
                              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{off.facultyName}</span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)' }}>Unallocated</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
