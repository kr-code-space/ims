import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import tableStyles from '../../styles/DataTable.module.css';

export default function StudentForum({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    anonymous: false,
  });

  useEffect(() => {
    let isCurrent = true;
    apiClient.get('/student/classes')
      .then((res) => {
        if (!isCurrent) return;
        const list = res.data || [];
        setClasses(list);
        if (list.length > 0) {
          setClassId(String(list[0].id));
        }
      })
      .catch((err) => {
        if (!isCurrent) return;
        const msg = err.response?.data?.message || 'Could not load your enrolled classes.';
        showToast(msg, 'error');
      });

    return () => {
      isCurrent = false;
    };
  }, [apiClient]);

  const loadPosts = async () => {
    if (!classId) return;
    setLoadingPosts(true);
    try {
      const res = await apiClient.get('/student/forum', {
        params: { academicClassId: Number(classId) },
      });
      setPosts(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load forum questions.';
      showToast(msg, 'error');
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (classId) {
      loadPosts();
    }
  }, [classId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!classId) return;

    setIsSubmitting(true);
    try {
      await apiClient.post('/student/forum/posts', {
        academicClassId: Number(classId),
        title: form.title.trim(),
        content: form.content.trim(),
        anonymous: form.anonymous,
      });
      showToast('Your question was posted to the class forum.', 'success');
      setForm({ title: '', content: '', anonymous: false });
      await loadPosts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not post question.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Peer Collaboration"
        title="Class Doubt & Discussion Forum"
        description="Ask academic questions, collaborate with peers and Class Representatives (CR), and share lecture doubts."
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '24px' }}>
        {/* Post Question Form */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            alignSelf: 'start',
          }}
        >
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              Ask a Question / Post Doubt
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Your classmates and Class Representative will see your post.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Class Cohort *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                required
              >
                {classes.length === 0 ? (
                  <option value="">No enrolled classes found</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Question Title *</label>
              <input
                type="text"
                placeholder="Brief summary of your doubt..."
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Detailed Discussion / Question *</label>
              <textarea
                rows={4}
                placeholder="Explain the concept, theorem, or assignment problem you need help with..."
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                required
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem' }}>
              <input
                type="checkbox"
                checked={form.anonymous}
                onChange={(e) => setForm((p) => ({ ...p, anonymous: e.target.checked }))}
              />
              <span>Post anonymously (Hide my student identity)</span>
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !classId}
              style={{ marginTop: '8px' }}
            >
              <Send size={16} />
              <span>{isSubmitting ? 'Posting...' : 'Post Question'}</span>
            </button>
          </form>
        </div>

        {/* Discussion Stream */}
        <div className={tableStyles.container}>
          <div className={tableStyles.toolbar}>
            <div className={tableStyles.summary}>
              <span className={tableStyles.summaryTitle}>Class Discussion Feed</span>
              <span className={tableStyles.summaryCount}>
                {posts.length} topic{posts.length === 1 ? '' : 's'} discussed
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
            {loadingPosts ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ width: '22px', height: '22px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                <span style={{ color: 'var(--text-muted)' }}>Loading discussion stream...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className={tableStyles.emptyState}>
                <MessageSquare size={36} />
                <span>No doubt topics posted yet. Be the first to ask a question!</span>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${post.anonymous ? 'badge-warning' : 'badge-primary'}`}>
                        {post.anonymous ? 'Anonymous Question' : post.student ? `${post.student.firstName} ${post.student.lastName}` : 'Classmate'}
                      </span>
                    </div>
                    {post.createdAt && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {post.title}
                  </h4>

                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {post.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
