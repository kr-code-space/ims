import { useEffect, useState } from 'react'
import './StudentAttendance.css'

function StudentAttendance({ apiClient }) {
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/student/attendance')
      .then((response) => {
        if (isCurrent) {
          setRecords(response.data)
          setLoading(false)
        }
      })
      .catch((requestError) => {
        if (isCurrent) {
          setError(requestError.response?.data?.message || 'Could not load attendance.')
          setLoading(false)
        }
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const subjectRows = Object.values(records.reduce((groups, record) => {
    const subject = record.subjectName || 'Unknown subject'
    groups[subject] ??= { subject, total: 0, present: 0 }
    groups[subject].total += 1
    if (record.present) groups[subject].present += 1
    return groups
  }, {}))

  return (
    <section className="student-attendance">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      <div className="student-attendance-stats">
        {subjectRows.map((row) => (
          <article className="metric-card" key={row.subject}>
            <span>{row.subject}</span>
            <strong>{row.total ? Math.round((row.present / row.total) * 100) : 0}%</strong>
            <small>{row.present} present / {row.total} classes</small>
          </article>
        ))}
      </div>
      {loading ? (
        <p className="empty-state">Loading attendance...</p>
      ) : (
        <section className="panel-card student-attendance-history">
          <h4>Attendance history</h4>
          {records.length ? (
            <div className="student-attendance-table-wrap">
              <table className="student-attendance-table">
                <thead><tr><th>Date</th><th>Subject</th><th>Class</th><th>Status</th></tr></thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.date}</td>
                      <td>{record.subjectName}</td>
                      <td>{record.academicClassName || '-'}</td>
                      <td><span className={record.present ? 'status-badge active' : 'status-badge inactive'}>{record.present ? 'Present' : 'Absent'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">No attendance records are available.</p>
          )}
        </section>
      )}
    </section>
  )
}

export default StudentAttendance
