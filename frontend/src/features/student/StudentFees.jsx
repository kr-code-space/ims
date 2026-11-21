import { useEffect, useState } from 'react'

function StudentFees({ apiClient }) {
  const [fees, setFees] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/student/fees')
      .then((response) => {
        if (isCurrent) setFees(response.data)
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load fee records.')
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  return (
    <section className="student-fees">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      {fees.map((fee) => (
        <article className="panel-card" key={fee.id}>
          <h4>{fee.feeType}</h4>
          <p>Amount: {fee.amount}</p>
          <p>Paid: {fee.paidAmount}</p>
          <p>Outstanding: {(Number(fee.amount) - Number(fee.paidAmount)).toFixed(2)}</p>
          <p>Due: {fee.dueDate}</p>
          <span className={fee.status === 'PAID' ? 'status-badge active' : 'status-badge inactive'}>{fee.status}</span>
        </article>
      ))}
      {!fees.length ? <p className="empty-state">No fee records.</p> : null}
    </section>
  )
}

export default StudentFees
