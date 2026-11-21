import { useEffect, useState } from 'react'
import './FacultyAssignments.css'

function FacultyAssignments({ apiClient }) {
  const [offerings, setOfferings] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [form, setForm] = useState({ offeringId: '', title: '', description: '', dueDate: '', maxMarks: 100 })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      const [offeringResponse, assignmentResponse] = await Promise.all([
        apiClient.get('/faculty/attendance/offerings'),
        apiClient.get('/faculty/assignments'),
      ])
      setOfferings(offeringResponse.data)
      setAssignments(assignmentResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load assignments.')
    }
  }

  useEffect(() => {
    let isCurrent = true
    Promise.all([
      apiClient.get('/faculty/attendance/offerings'),
      apiClient.get('/faculty/assignments'),
    ]).then(([offeringResponse, assignmentResponse]) => {
      if (isCurrent) {
        setOfferings(offeringResponse.data)
        setAssignments(assignmentResponse.data)
      }
    }).catch((requestError) => {
      if (isCurrent) setError(requestError.response?.data?.message || 'Could not load assignments.')
    })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const create = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    const offering = offerings.find((item) => String(item.offeringId) === form.offeringId)
    if (!offering) return
    try {
      await apiClient.post('/faculty/assignments', {
        academicClassId: offering.academicClassId,
        subjectId: offering.subjectId,
        title: form.title,
        description: form.description,
        dueDate: form.dueDate,
        maxMarks: Number(form.maxMarks),
      })
      setNotice('Assignment created.')
      setForm({ offeringId: '', title: '', description: '', dueDate: '', maxMarks: 100 })
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create assignment.')
    }
  }

  const viewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment)
    setError('')
    try {
      const response = await apiClient.get(`/faculty/assignments/${assignment.id}/submissions`)
      setSubmissions(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load submissions.')
    }
  }

  const evaluate = async (submission, marks, feedback) => {
    try {
      await apiClient.put(`/faculty/submissions/${submission.id}`, { marks: Number(marks), feedback })
      setNotice('Submission evaluated.')
      await viewSubmissions(selectedAssignment)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not evaluate submission.')
    }
  }

  return (
    <section className="faculty-assignment">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {notice ? <p className="success-message" role="status">{notice}</p> : null}
      <form className="panel-card faculty-assignment-form" onSubmit={create}>
        <h4>Create assignment</h4>
        <select value={form.offeringId} onChange={(event) => setForm({ ...form, offeringId: event.target.value })} required>
          <option value="">Select class and subject</option>
          {offerings.map((item) => <option key={item.offeringId} value={item.offeringId}>{item.academicClassName} - {item.subjectName}</option>)}
        </select>
        <input placeholder="Assignment title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <textarea placeholder="Instructions" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
        <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required />
        <input type="number" min="1" value={form.maxMarks} onChange={(event) => setForm({ ...form, maxMarks: event.target.value })} required />
        <button type="submit" className="primary-button">Create assignment</button>
      </form>

      <section className="panel-card assignment-records">
        <h4>Assignments</h4>
        {assignments.map((assignment) => (
          <button type="button" className="assignment-row" key={assignment.id} onClick={() => viewSubmissions(assignment)}>
            <strong>{assignment.title}</strong>
            <span>{assignment.academicClassName} - {assignment.subjectName}</span>
            <span>Due {assignment.dueDate} | {assignment.maxMarks} marks</span>
          </button>
        ))}
        {!assignments.length ? <p className="empty-state">No assignments yet.</p> : null}
      </section>

      {selectedAssignment ? (
        <section className="panel-card submission-list">
          <h4>Submissions for {selectedAssignment.title}</h4>
          {submissions.map((submission) => (
            <SubmissionEvaluation key={submission.id} submission={submission} onEvaluate={evaluate} />
          ))}
          {!submissions.length ? <p className="empty-state">No submissions yet.</p> : null}
        </section>
      ) : null}
    </section>
  )
}

function SubmissionEvaluation({ submission, onEvaluate }) {
  const [marks, setMarks] = useState(submission.marks || '')
  const [feedback, setFeedback] = useState(submission.feedback || '')
  return (
    <div className="submission-row">
      <div><strong>{submission.studentName}</strong><p>{submission.submittedText || 'No text submitted'}</p></div>
      <input type="number" min="0" placeholder="Marks" value={marks} onChange={(event) => setMarks(event.target.value)} />
      <textarea placeholder="Feedback" value={feedback} onChange={(event) => setFeedback(event.target.value)} />
      <button type="button" className="secondary-button" onClick={() => onEvaluate(submission, marks, feedback)}>Evaluate</button>
    </div>
  )
}

export default FacultyAssignments
