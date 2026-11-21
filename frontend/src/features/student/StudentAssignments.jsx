import { useEffect, useState } from 'react'
import './StudentAssignments.css'

function StudentAssignments({ apiClient }) {
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [texts, setTexts] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      const [assignmentResponse, submissionResponse] = await Promise.all([
        apiClient.get('/student/assignments'),
        apiClient.get('/student/assignments/submissions'),
      ])
      setAssignments(assignmentResponse.data)
      setSubmissions(submissionResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load assignments.')
    }
  }

  useEffect(() => {
    let isCurrent = true
    Promise.all([
      apiClient.get('/student/assignments'),
      apiClient.get('/student/assignments/submissions'),
    ]).then(([assignmentResponse, submissionResponse]) => {
      if (isCurrent) {
        setAssignments(assignmentResponse.data)
        setSubmissions(submissionResponse.data)
      }
    }).catch((requestError) => {
      if (isCurrent) setError(requestError.response?.data?.message || 'Could not load assignments.')
    })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const submissionByAssignment = Object.fromEntries(submissions.map((item) => [item.assignmentId, item]))

  const submit = async (assignment) => {
    setError('')
    setNotice('')
    try {
      await apiClient.post('/student/assignments/submit', {
        assignmentId: assignment.id,
        submittedText: texts[assignment.id] || '',
      })
      setNotice(`Submission saved for ${assignment.title}.`)
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not submit assignment.')
    }
  }

  return (
    <section className="student-assignment">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {notice ? <p className="success-message" role="status">{notice}</p> : null}
      {assignments.map((assignment) => {
        const submission = submissionByAssignment[assignment.id]
        return (
          <section className="panel-card student-assignment-card" key={assignment.id}>
            <div>
              <p className="eyebrow">{assignment.academicClassName} - {assignment.subjectName}</p>
              <h4>{assignment.title}</h4>
              <p>{assignment.description || 'No instructions provided.'}</p>
              <small>Due {assignment.dueDate} | {assignment.maxMarks} marks</small>
            </div>
            {submission ? (
              <div className="submission-status">
                <strong>Status: {submission.status}</strong>
                {submission.feedback ? <p>Feedback: {submission.feedback}</p> : null}
                {submission.status === 'EVALUATED' ? <p>Marks: {submission.marks} / {assignment.maxMarks}</p> : null}
              </div>
            ) : null}
            <textarea
              placeholder="Enter your submission"
              value={texts[assignment.id] ?? submission?.submittedText ?? ''}
              onChange={(event) => setTexts((current) => ({ ...current, [assignment.id]: event.target.value }))}
            />
            <button type="button" className="primary-button" onClick={() => submit(assignment)}>
              {submission ? 'Update submission' : 'Submit assignment'}
            </button>
          </section>
        )
      })}
      {!assignments.length ? <p className="empty-state">No assignments are available.</p> : null}
    </section>
  )
}

export default StudentAssignments
