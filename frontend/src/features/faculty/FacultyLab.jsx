import { useEffect, useState } from 'react'

function FacultyLab({ apiClient }) {
  const [equipment, setEquipment] = useState([])
  const [form, setForm] = useState({ name: '', serialNumber: '', status: 'AVAILABLE', maintenanceNotes: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/faculty/lab-access')
      .then((response) => {
        if (isCurrent) setEquipment(response.data)
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.response?.data?.message || 'Lab access is required.')
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const submit = async (event) => {
    event.preventDefault()
    try {
      await apiClient.post('/faculty/lab-access/equipment', form)
      setForm({ name: '', serialNumber: '', status: 'AVAILABLE', maintenanceNotes: '' })
      const response = await apiClient.get('/faculty/lab-access')
      setEquipment(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save equipment.')
    }
  }

  return (
    <section className="panel-card">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      <form onSubmit={submit} className="user-form-grid">
        <input placeholder="Equipment name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
        <input placeholder="Serial number" value={form.serialNumber} onChange={(event) => setForm({ ...form, serialNumber: event.target.value })} required />
        <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
          <option>AVAILABLE</option><option>IN_USE</option><option>MAINTENANCE</option><option>OUT_OF_SERVICE</option>
        </select>
        <input placeholder="Maintenance notes" value={form.maintenanceNotes} onChange={(event) => setForm({ ...form, maintenanceNotes: event.target.value })} />
        <button type="submit" className="primary-button">Add equipment</button>
      </form>
      {equipment.map((item) => (
        <div className="metric-card" key={item.id}>
          <strong>{item.name}</strong><span>{item.serialNumber}</span><span>{item.status}</span>
        </div>
      ))}
      {!equipment.length ? <p className="empty-state">No laboratory equipment.</p> : null}
    </section>
  )
}

export default FacultyLab
