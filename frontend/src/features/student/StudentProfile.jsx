import { useEffect, useState } from 'react'

function StudentProfile({ apiClient }) {
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/student/profile')
      .then((response) => {
        if (isCurrent) setProfile(response.data)
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load profile.')
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  return (
    <section className="student-profile panel-card">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {profile ? (
        <>
          <h3>{profile.firstName} {profile.lastName}</h3>
          <p><strong>Student number:</strong> {profile.studentNumber}</p>
          <p><strong>Department:</strong> {profile.department}</p>
          <p><strong>Year:</strong> {profile.year}</p>
          <p><strong>Class:</strong> {profile.className}</p>
          <p><strong>Status:</strong> {profile.active ? 'Active' : 'Inactive'}</p>
        </>
      ) : !error ? <p className="empty-state">Loading profile...</p> : null}
    </section>
  )
}

export default StudentProfile
