import { useEffect, useState } from 'react'

function StudentForum({ apiClient }) {
  const [classes, setClasses] = useState([])
  const [classId, setClassId] = useState('')
  const [posts, setPosts] = useState([])
  const [form, setForm] = useState({ title: '', content: '', anonymous: false })
  const [error, setError] = useState('')

  useEffect(() => {
    let isCurrent = true
    apiClient.get('/student/classes')
      .then((response) => {
        if (isCurrent) setClasses(response.data)
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.response?.data?.message || 'Could not load classes.')
      })
    return () => {
      isCurrent = false
    }
  }, [apiClient])

  const loadPosts = async () => {
    if (!classId) return
    try {
      const response = await apiClient.get('/student/forum', { params: { academicClassId: Number(classId) } })
      setPosts(response.data)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not load forum posts.')
    }
  }

  const submitPost = async (event) => {
    event.preventDefault()
    if (!classId) return
    try {
      await apiClient.post('/student/forum/posts', {
        academicClassId: Number(classId),
        ...form,
      })
      setForm({ title: '', content: '', anonymous: false })
      await loadPosts()
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not create forum post.')
    }
  }

  return (
    <section className="panel-card">
      {error ? <p className="error-message" role="alert">{error}</p> : null}
      <div className="field-row">
        <label>Class</label>
        <select value={classId} onChange={(event) => setClassId(event.target.value)}>
          <option value="">Select class</option>
          {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <button type="button" className="primary-button" onClick={loadPosts} disabled={!classId}>Load forum</button>
      {classId ? (
        <form onSubmit={submitPost} className="student-assignment-card">
          <input placeholder="Post title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          <textarea placeholder="Doubt or discussion" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} required />
          <label><input type="checkbox" checked={form.anonymous} onChange={(event) => setForm({ ...form, anonymous: event.target.checked })} /> Post anonymously</label>
          <button type="submit" className="primary-button">Post doubt</button>
        </form>
      ) : null}
      {posts.map((post) => (
        <article className="metric-card" key={post.id}>
          <strong>{post.title}</strong>
          <p>{post.content}</p>
          <span>{post.anonymous ? 'Anonymous' : 'Student post'}</span>
        </article>
      ))}
      {classId && !posts.length ? <p className="empty-state">No forum posts.</p> : null}
    </section>
  )
}

export default StudentForum
