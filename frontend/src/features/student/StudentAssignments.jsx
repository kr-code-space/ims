import React, { useEffect, useState } from 'react';
import {
  FileText,
  CheckCircle2,
  Send,
  Award,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

export default function StudentAssignments({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submissionTexts, setSubmissionTexts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [assignRes, subRes] = await Promise.all([
        apiClient.get('/student/assignments'),
        apiClient.get('/student/assignments/submissions'),
      ]);
      setAssignments(assignRes.data || []);
      setSubmissions(subRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load coursework assignments.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiClient]);

  const submissionByAssignment = Object.fromEntries(
    submissions.map((item) => [item.assignmentId, item])
  );

  const handleSubmit = async (assignment) => {
    const text = submissionTexts[assignment.id];
    const existing = submissionByAssignment[assignment.id];
    const textToSubmit = text !== undefined ? text : existing?.submittedText || '';

    if (!textToSubmit.trim()) {
      showToast('Please enter your coursework response before submitting.', 'warning');
      return;
    }

    setSubmittingId(assignment.id);
    try {
      await apiClient.post('/student/assignments/submit', {
        assignmentId: assignment.id,
        submittedText: textToSubmit.trim(),
      });
      showToast(`Submission saved for "${assignment.title}".`, 'success');
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not submit assignment.';
      showToast(msg, 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="My Coursework"
        title="Course Assignments & Submissions"
        description="View assigned homework and practical tasks, submit your work online, and review instructor feedback and grades."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Total Assigned"
          value={assignments.length}
          icon={FileText}
          color="primary"
          subtext="Available tasks"
        />
        <StatCard
          label="My Submissions"
          value={submissions.length}
          icon={CheckCircle2}
          color="info"
          subtext="Completed work"
        />
        <StatCard
          label="Evaluated"
          value={submissions.filter((s) => s.status === 'EVALUATED').length}
          icon={Award}
          color="success"
          subtext="Graded with marks"
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-color)', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <span style={{ color: 'var(--text-muted)' }}>Loading coursework...</span>
          </div>
        ) : assignments.length === 0 ? (
          <div className={tableStyles.container} style={{ padding: '48px', textAlign: 'center' }}>
            <div className={tableStyles.emptyState}>
              <FileText size={40} />
              <span>No assignments have been assigned to your classes yet.</span>
            </div>
          </div>
        ) : (
          assignments.map((assignment) => {
            const submission = submissionByAssignment[assignment.id];
            const isEvaluated = submission?.status === 'EVALUATED';
            const isSubmitting = submittingId === assignment.id;
            const currentText =
              submissionTexts[assignment.id] !== undefined
                ? submissionTexts[assignment.id]
                : submission?.submittedText || '';

            return (
              <div
                key={assignment.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-primary">{assignment.academicClassName}</span>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>{assignment.subjectName}</span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                      {assignment.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-warning">
                      Due: {assignment.dueDate}
                    </span>
                    <span className="badge badge-primary">
                      Max Marks: {assignment.maxMarks}
                    </span>
                    {submission && (
                      <StatusBadge status={submission.status} />
                    )}
                  </div>
                </div>

                {assignment.description && (
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {assignment.description}
                  </p>
                )}

                {/* Grade & Feedback Banner */}
                {submission && (
                  <div
                    style={{
                      backgroundColor: isEvaluated ? 'var(--success-bg)' : 'var(--bg-hover)',
                      border: '1px solid',
                      borderColor: isEvaluated ? 'var(--success)' : 'var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '0.92rem', color: isEvaluated ? 'var(--success)' : 'var(--text-primary)' }}>
                        {isEvaluated ? `Graded: ${submission.marks} / ${assignment.maxMarks} Marks` : 'Submission Received • Awaiting Instructor Review'}
                      </strong>
                      {submission.feedback && (
                        <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                          <strong>Instructor Feedback:</strong> {submission.feedback}
                        </p>
                      )}
                    </div>
                    {submission.submittedAt && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Submission Text Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Your Solution / Submission Text
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type or paste your coursework answers here..."
                    value={currentText}
                    onChange={(e) =>
                      setSubmissionTexts((prev) => ({
                        ...prev,
                        [assignment.id]: e.target.value,
                      }))
                    }
                    disabled={isSubmitting}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit(assignment)}
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Submitting...' : submission ? 'Update Submission' : 'Turn In Assignment'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
