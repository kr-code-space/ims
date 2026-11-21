import { useEffect, useState } from 'react'
import './FacultyAttendance.css'

function FacultyAttendance({ apiClient }) {
  const [offerings, setOfferings] = useState([])
  const [offeringId, setOfferingId] = useState('')
  const [date, setDate] = useState('')
  const [roster, setRoster] = useState([])
  const [attendance, setAttendance] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/faculty/attendance/offerings')
      .then((response) => {
        if (isCurrent) setOfferings(response.data)
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load assigned offerings.')
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const selected = offerings.find((item) => String(item.offeringId) === String(offeringId))

  const loadRoster = async () => {
    if (!selected) return
    setError('')
    setNotice('')
    try {
      const [rosterResponse, recordsResponse] = await Promise.all([
        apiClient.get('/faculty/attendance/roster', {
          params: { academicClassId: selected.academicClassId, subjectId: selected.subjectId },
        }),
        apiClient.get('/faculty/attendance/records', {
          params: { academicClassId: selected.academicClassId, subjectId: selected.subjectId, date },
        }),
      ])
      setRoster(rosterResponse.data)
      const presentMap = Object.fromEntries(recordsResponse.data.map((record) => [record.studentId, record.present]))
      setAttendance(Object.fromEntries(rosterResponse.data.map((entry) => [entry.studentId, presentMap[entry.studentId] ?? true])))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load attendance data.')
    }
  }

  const save = async () => {
    if (!selected) return
    setError('')
    setNotice('')
    try {
      await apiClient.post('/faculty/attendance/records', {
        academicClassId: selected.academicClassId,
        subjectId: selected.subjectId,
        date,
        entries: roster.map((entry) => ({
          studentId: entry.studentId,
          present: Boolean(attendance[entry.studentId]),
          remarks: '',
        })),
      })
      setNotice('Attendance saved.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save attendance.')
    }
  }

  return (
    <section className="faculty-attendance">
      <div className="attendance-controls">
        <div className="attendance-field">
          <label>Assigned offering</label>
          <select value={offeringId} onChange={(event) => setOfferingId(event.target.value)}>
            <option value="">Select class and subject</option>
            {offerings.map((item) => (
              <option key={item.offeringId} value={item.offeringId}>
                {item.academicClassName} - {item.subjectName}
              </option>
            ))}
          </select>
        </div>
        <div className="attendance-field">
          <label>Date</label>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </div>
        <button type="button" className="primary-button" onClick={loadRoster} disabled={!selected || !date}>Load roster</button>
      </div>

      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {notice ? <p className="success-message" role="status">{notice}</p> : null}

      {roster.length ? (
        <section className="panel-card attendance-panel">
          <div className="attendance-table-wrap">
            <table className="attendance-table">
              <thead><tr><th>Student</th><th>Student number</th><th>Present</th></tr></thead>
              <tbody>
                {roster.map((entry) => (
                  <tr key={entry.studentId}>
                    <td>{entry.studentName}</td>
                    <td>{entry.studentNumber}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={Boolean(attendance[entry.studentId])}
                        onChange={(event) => setAttendance((current) => ({
                          ...current,
                          [entry.studentId]: event.target.checked,
                        }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="primary-button attendance-save" onClick={save}>Save attendance</button>
        </section>
      ) : (
        <p className="empty-state">Select an offering and load the student roster.</p>
      )}
    </section>
  )
}

export default FacultyAttendance
