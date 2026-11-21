import { useEffect, useState } from 'react'

function LibrarianLibrary({ apiClient }) {
  const [books, setBooks] = useState([])
  const [issues, setIssues] = useState([])
  const [form, setForm] = useState({ title: '', author: '', isbn: '', totalCopies: 1 })
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    Promise.all([apiClient.get('/librarian/books'), apiClient.get('/librarian/issues')])
      .then(([bookResponse, issueResponse]) => {
        if (isCurrent) {
          setBooks(bookResponse.data)
          setIssues(issueResponse.data)
        }
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load library records.')
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const submitBook = async (event) => {
    event.preventDefault()
    try {
      await apiClient.post('/librarian/books', {
        ...form,
        totalCopies: Number(form.totalCopies),
      })
      setForm({ title: '', author: '', isbn: '', totalCopies: 1 })
      const response = await apiClient.get('/librarian/books')
      setBooks(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create book.')
    }
  }

  return (
    <section className="panel-card">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      <h3>Catalogue</h3>
      <form onSubmit={submitBook} className="user-form-grid">
        <input placeholder="Title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        <input placeholder="Author" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} required />
        <input placeholder="ISBN" value={form.isbn} onChange={(event) => setForm({ ...form, isbn: event.target.value })} required />
        <input type="number" min="1" value={form.totalCopies} onChange={(event) => setForm({ ...form, totalCopies: event.target.value })} required />
        <button type="submit" className="primary-button">Add book</button>
      </form>
      {books.map((book) => (
        <div className="metric-card" key={book.id}>
          <strong>{book.title}</strong>
          <span>{book.author} - {book.isbn}</span>
          <span>{book.availableCopies} of {book.totalCopies} available</span>
        </div>
      ))}
      <h3>Issues</h3>
      <p>{issues.length} circulation record{issues.length === 1 ? '' : 's'}</p>
    </section>
  )
}

export default LibrarianLibrary
