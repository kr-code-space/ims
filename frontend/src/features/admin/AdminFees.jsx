import { useEffect, useState } from 'react'
import './AdminFees.css'

function AdminFees({ apiClient }) {
  const [fees, setFees] = useState([])
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ studentId: '', feeType: '', amount: '', dueDate: '' })
  const [payment, setPayment] = useState({})
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    try {
      const [feesResponse, studentsResponse] = await Promise.all([
        apiClient.get('/admin/fees'),
        apiClient.get('/admin/students'),
      ])
      setFees(feesResponse.data)
      setStudents(studentsResponse.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load fee records.')
    }
  }

  useEffect(() => {
    let isCurrent = true
    Promise.all([apiClient.get('/admin/fees'), apiClient.get('/admin/students')])
      .then(([feesResponse, studentsResponse]) => {
        if (isCurrent) {
          setFees(feesResponse.data)
          setStudents(studentsResponse.data)
        }
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load fee records.')
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const create = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      await apiClient.post('/admin/fees', {
        studentId: Number(form.studentId),
        feeType: form.feeType,
        amount: form.amount,
        dueDate: form.dueDate,
      })
      setNotice('Fee record created.')
      setForm({ studentId: '', feeType: '', amount: '', dueDate: '' })
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create fee record.')
    }
  }

  const recordPayment = async (fee) => {
    const paidAmount = payment[fee.id]
    if (!paidAmount) return
    setError('')
    setNotice('')
    try {
      await apiClient.put(`/admin/fees/${fee.id}/payment`, { paidAmount })
      setNotice('Payment recorded.')
      setPayment((current) => ({ ...current, [fee.id]: '' }))
      await load()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not record payment.')
    }
  }

  return (
    <section className="admin-fees">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {notice ? <p className="success-message" role="status">{notice}</p> : null}
      <form className="panel-card fee-create-form" onSubmit={create}>
        <h4>Create fee record</h4>
        <select value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} required>
          <option value="">Select student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>{student.firstName} {student.lastName} ({student.studentNumber})</option>
          ))}
        </select>
        <input placeholder="Fee type" value={form.feeType} onChange={(event) => setForm({ ...form, feeType: event.target.value })} required />
        <input type="number" min="0.01" step="0.01" placeholder="Amount" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required />
        <input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required />
        <button type="submit" className="primary-button">Create fee</button>
      </form>
      <section className="panel-card fee-table-panel">
        <h4>Fee records</h4>
        <div className="fee-table-wrap">
          <table className="fee-table">
            <thead><tr><th>Student</th><th>Type</th><th>Amount</th><th>Paid</th><th>Status</th><th>Due</th><th>Payment</th></tr></thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td>{fee.studentName}</td><td>{fee.feeType}</td><td>{fee.amount}</td><td>{fee.paidAmount}</td>
                  <td>{fee.status}</td><td>{fee.dueDate}</td>
                  <td>
                    {fee.status !== 'PAID' ? (
                      <div className="payment-action">
                        <input type="number" min="0.01" step="0.01" value={payment[fee.id] || ''} onChange={(event) => setPayment((current) => ({ ...current, [fee.id]: event.target.value }))} />
                        <button type="button" className="text-button" onClick={() => recordPayment(fee)}>Record</button>
                      </div>
                    ) : 'Paid'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!fees.length ? <p className="empty-state">No fee records.</p> : null}
        </div>
      </section>
    </section>
  )
}

export default AdminFees
