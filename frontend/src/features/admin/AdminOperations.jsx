import { useEffect, useState } from 'react'

function AdminOperations({ apiClient }) {
  const [staff, setStaff] = useState([])
  const [facilities, setFacilities] = useState([])
  const [audit, setAudit] = useState([])
  const [staffForm, setStaffForm] = useState({ employeeNumber: '', firstName: '', lastName: '', department: '', designation: '' })
  const [facilityForm, setFacilityForm] = useState({ name: '', type: '', status: 'AVAILABLE', location: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    Promise.all([apiClient.get('/admin/staff'), apiClient.get('/admin/facilities'), apiClient.get('/admin/audit')])
      .then(([staffResponse, facilityResponse, auditResponse]) => {
        if (isCurrent) {
          setStaff(staffResponse.data)
          setFacilities(facilityResponse.data)
          setAudit(auditResponse.data)
        }
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load operations records.')
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const createStaff = async (event) => {
    event.preventDefault()
    try {
      await apiClient.post('/admin/staff', { ...staffForm, active: true })
      setStaffForm({ employeeNumber: '', firstName: '', lastName: '', department: '', designation: '' })
      const response = await apiClient.get('/admin/staff')
      setStaff(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create staff record.')
    }
  }

  const createFacility = async (event) => {
    event.preventDefault()
    try {
      await apiClient.post('/admin/facilities', facilityForm)
      setFacilityForm({ name: '', type: '', status: 'AVAILABLE', location: '' })
      const response = await apiClient.get('/admin/facilities')
      setFacilities(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create facility.')
    }
  }

  return (
    <section className="panel-card">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      <h3>Staff</h3>
      <form onSubmit={createStaff} className="user-form-grid">
        {['employeeNumber', 'firstName', 'lastName', 'department', 'designation'].map((name) => (
          <input key={name} placeholder={name} value={staffForm[name]} onChange={(event) => setStaffForm({ ...staffForm, [name]: event.target.value })} required />
        ))}
        <button type="submit" className="primary-button">Add staff</button>
      </form>
      {staff.map((item) => <div className="metric-card" key={item.id}><strong>{item.firstName} {item.lastName}</strong><span>{item.employeeNumber} - {item.department}</span></div>)}

      <h3>Facilities</h3>
      <form onSubmit={createFacility} className="user-form-grid">
        <input placeholder="Facility name" value={facilityForm.name} onChange={(event) => setFacilityForm({ ...facilityForm, name: event.target.value })} required />
        <input placeholder="Type" value={facilityForm.type} onChange={(event) => setFacilityForm({ ...facilityForm, type: event.target.value })} required />
        <input placeholder="Location" value={facilityForm.location} onChange={(event) => setFacilityForm({ ...facilityForm, location: event.target.value })} />
        <button type="submit" className="primary-button">Add facility</button>
      </form>
      {facilities.map((item) => <div className="metric-card" key={item.id}><strong>{item.name}</strong><span>{item.type} - {item.status}</span></div>)}

      <h3>Audit log</h3>
      {audit.map((item) => <div className="metric-card" key={item.id}><strong>{item.action}</strong><span>{item.actor} - {item.entityType} {item.entityId || ''}</span></div>)}
      {!audit.length ? <p className="empty-state">No audit entries.</p> : null}
    </section>
  )
}

export default AdminOperations
