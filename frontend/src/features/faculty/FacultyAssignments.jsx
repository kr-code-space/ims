import React, { useEffect, useState } from 'react';
import {
  FileText,
  Plus,
  ArrowRight,
  Award,
  Users,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

export default function FacultyAssignments({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [offerings, setOfferings] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    offeringId: '',
    title: '',
    description: '',
    dueDate: '',
    maxMarks: 100,
  });

  const [evaluation, setEvaluation] = useState({});

  const loadData = async () => {
    try {
      const [offeringsRes, assignmentsRes] = await Promise.all([
        apiClient.get('/faculty/attendance/offerings'),
        apiClient.get('/faculty/assignments'),
      ]);
      setOfferings(offeringsRes.data || []);
      setAssignments(assignmentsRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load assignments.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiClient]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const offering = offerings.find((item) => String(item.offeringId) === form.offeringId);
    if (!offering) {
      showToast('Please select a course offering.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/faculty/assignments', {
        academicClassId: offering.academicClassId,
        subjectId: offering.subjectId,
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate,
        maxMarks: Number(form.maxMarks),
      });
      showToast('Assignment created successfully.', 'success');
      setForm({ offeringId: '', title: '', description: '', dueDate: '', maxMarks: 100 });
      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create assignment.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    try {
      const res = await apiClient.get(`/faculty/assignments/${assignment.id}/submissions`);
      setSubmissions(res.data || []);
      const initialEvals = {};
      (res.data || []).forEach((s) => {
        initialEvals[s.id] = {
          marks: s.marks || '',
          feedback: s.feedback || '',
        };
      });
      setEvaluation(initialEvals);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load student submissions.';
      showToast(msg, 'error');
    }
  };

  const handleEvaluate = async (submissionId) => {
    const evalData = evaluation[submissionId];
    if (!evalData || evalData.marks === '') {
      showToast('Please enter marks before grading.', 'warning');
      return;
    }

    try {
      await apiClient.put(`/faculty/submissions/${submissionId}`, {
        marks: Number(evalData.marks),
        feedback: evalData.feedback || '',
      });
      showToast('Submission evaluated.', 'success');
      if (selectedAssignment) {
        await viewSubmissions(selectedAssignment);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not evaluate submission.';
      showToast(msg, 'error');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Academic Coursework"
        title="Assignments & Evaluations"
        description="Publish coursework tasks, set deadlines and maximum marks, review student text submissions, and issue grades."
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus size={18} />
          <span>Create Assignment</span>
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Total Assignments"
          value={assignments.length}
          icon={FileText}
          color="primary"
          subtext="Created coursework"
        />
        <StatCard
          label="Assigned Classes"
          value={offerings.length}
          icon={Users}
          color="info"
          subtext="Teaching sections"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedAssignment ? '1.2fr 1.8fr' : '1fr', gap: '24px' }}>
        {/* Assignments List */}
        <div className={tableStyles.container}>
          <div className={tableStyles.toolbar}>
            <div className={tableStyles.summary}>
              <span className={tableStyles.summaryTitle}>Coursework Assignments</span>
              <span className={tableStyles.summaryCount}>
                {assignments.length} assignment{assignments.length === 1 ? '' : 's'} published
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ width: '24px', height: '24px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 10px' }} />
                <span style={{ color: 'var(--text-muted)' }}>Loading coursework...</span>
              </div>
            ) : assignments.length === 0 ? (
              <div className={tableStyles.emptyState}>
                <FileText size={36} />
                <span>No assignments created yet. Click "Create Assignment" to post coursework.</span>
              </div>
            ) : (
              assignments.map((assignment) => {
                const isSelected = selectedAssignment?.id === assignment.id;
                return (
                  <div
                    key={assignment.id}
                    onClick={() => viewSubmissions(assignment)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      backgroundColor: isSelected ? 'var(--primary-light)' : 'var(--bg-hover)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-primary">{assignment.academicClassName}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{assignment.subjectName}</span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        {assignment.title}
                      </h4>
                      <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        Due: {assignment.dueDate} • Max Marks: {assignment.maxMarks}
                      </p>
                    </div>
                    <ArrowRight size={18} style={{ color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submissions Evaluation Panel */}
        {selectedAssignment && (
          <div className={tableStyles.container}>
            <div className={tableStyles.toolbar}>
              <div className={tableStyles.summary}>
                <span className={tableStyles.summaryTitle}>
                  Submissions: {selectedAssignment.title}
                </span>
                <span className={tableStyles.summaryCount}>
                  Max Marks: {selectedAssignment.maxMarks} • Due {selectedAssignment.dueDate}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
              {submissions.length === 0 ? (
                <div className={tableStyles.emptyState}>
                  <Users size={36} />
                  <span>No student submissions received for this assignment yet.</span>
                </div>
              ) : (
                submissions.map((submission) => {
                  const evalState = evaluation[submission.id] || { marks: '', feedback: '' };
                  const isEvaluated = submission.status === 'EVALUATED';

                  return (
                    <div
                      key={submission.id}
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <strong style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                            {submission.studentName}
                          </strong>
                          <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                          </span>
                        </div>
                        <StatusBadge status={submission.status} />
                      </div>

                      <div
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.88rem',
                          color: 'var(--text-primary)',
                          lineHeight: 1.5,
                        }}
                      >
                        {submission.submittedText || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No written submission provided.</span>}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: '12px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                            Marks (Max: {selectedAssignment.maxMarks})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={selectedAssignment.maxMarks}
                            placeholder="Score"
                            value={evalState.marks}
                            onChange={(e) =>
                              setEvaluation((prev) => ({
                                ...prev,
                                [submission.id]: { ...evalState, marks: e.target.value },
                              }))
                            }
                          />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Feedback Remarks</label>
                          <input
                            type="text"
                            placeholder="Optional evaluation comments..."
                            value={evalState.feedback}
                            onChange={(e) =>
                              setEvaluation((prev) => ({
                                ...prev,
                                [submission.id]: { ...evalState, feedback: e.target.value },
                              }))
                            }
                          />
                        </div>

                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                          onClick={() => handleEvaluate(submission.id)}
                        >
                          <Award size={15} />
                          <span>{isEvaluated ? 'Update' : 'Grade'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Course Assignment"
        maxWidth={540}
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Class & Subject Offering *</label>
            <select
              value={form.offeringId}
              onChange={(e) => setForm((p) => ({ ...p, offeringId: e.target.value }))}
              required
            >
              <option value="">Select Offering</option>
              {offerings.map((item) => (
                <option key={item.offeringId} value={item.offeringId}>
                  {item.academicClassName} — {item.subjectName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Assignment Title *</label>
            <input
              type="text"
              placeholder="e.g. Lab Assignment 2 — Multithreading"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Instructions / Description</label>
            <textarea
              rows={3}
              placeholder="Describe tasks, rubrics, and submission guidelines..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Maximum Marks *</label>
              <input
                type="number"
                min="1"
                value={form.maxMarks}
                onChange={(e) => setForm((p) => ({ ...p, maxMarks: e.target.value }))}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !offerings.length}>
              {isSubmitting ? 'Creating...' : 'Publish Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
