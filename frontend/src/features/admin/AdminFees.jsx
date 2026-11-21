import React, { useEffect, useState, useMemo } from 'react';
import {
  CircleDollarSign,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Plus,
  Search,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

export default function AdminFees({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    studentId: '',
    feeType: '',
    amount: '',
    dueDate: '',
  });

  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [activePaymentFee, setActivePaymentFee] = useState(null);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const loadData = async () => {
    try {
      const [feesRes, studentsRes] = await Promise.all([
        apiClient.get('/admin/fees'),
        apiClient.get('/admin/students'),
      ]);
      setFees(feesRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load fee records.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiClient]);

  const stats = useMemo(() => {
    let totalBilled = 0;
    let totalPaid = 0;
    fees.forEach((f) => {
      totalBilled += Number(f.amount || 0);
      totalPaid += Number(f.paidAmount || 0);
    });
    const outstanding = Math.max(0, totalBilled - totalPaid);
    return { totalBilled, totalPaid, outstanding };
  }, [fees]);

  const filteredFees = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return fees;
    return fees.filter((f) =>
      [f.studentName, f.feeType, f.status, f.dueDate].some((val) =>
        val?.toLowerCase().includes(q)
      )
    );
  }, [fees, filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/admin/fees', {
        studentId: Number(form.studentId),
        feeType: form.feeType.trim(),
        amount: Number(form.amount),
        dueDate: form.dueDate,
      });
      showToast('Fee invoice record created.', 'success');
      setForm({ studentId: '', feeType: '', amount: '', dueDate: '' });
      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create fee record.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!activePaymentFee) return;

    const amount = Number(paymentAmounts[activePaymentFee.id]);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid positive payment amount.', 'warning');
      return;
    }

    setIsRecordingPayment(true);
    try {
      await apiClient.put(`/admin/fees/${activePaymentFee.id}/payment`, {
        paidAmount: amount,
      });
      showToast(`Payment of ₹${amount.toFixed(2)} recorded successfully.`, 'success');
      setPaymentAmounts((prev) => ({ ...prev, [activePaymentFee.id]: '' }));
      setActivePaymentFee(null);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not record payment.';
      showToast(msg, 'error');
    } finally {
      setIsRecordingPayment(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Finance & Billing"
        title="Fee Management & Invoicing"
        description="Track institutional tuition fees, semester dues, student payments, and outstanding balances."
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus size={18} />
          <span>Create Fee Record</span>
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Total Invoiced"
          value={`₹${stats.totalBilled.toFixed(2)}`}
          icon={CircleDollarSign}
          color="primary"
          subtext="Total fees levied"
        />
        <StatCard
          label="Total Collected"
          value={`₹${stats.totalPaid.toFixed(2)}`}
          icon={CheckCircle2}
          color="success"
          subtext="Receipts recorded"
        />
        <StatCard
          label="Outstanding Dues"
          value={`₹${stats.outstanding.toFixed(2)}`}
          icon={AlertCircle}
          color="warning"
          subtext="Pending student balance"
        />
        <StatCard
          label="Total Invoices"
          value={fees.length}
          icon={Receipt}
          color="info"
          subtext="Fee entries"
        />
      </div>

      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>Student Fee Register</span>
            <span className={tableStyles.summaryCount}>
              Showing {filteredFees.length} of {fees.length} invoice record{fees.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className={tableStyles.searchWrapper}>
            <Search size={16} className={tableStyles.searchIcon} />
            <input
              type="text"
              className={tableStyles.searchInput}
              placeholder="Search by student, fee type, status..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Student</th>
                <th>Fee Type</th>
                <th>Total Billed</th>
                <th>Paid Amount</th>
                <th>Outstanding</th>
                <th>Due Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Loading fee records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className={tableStyles.emptyState}>
                      <CircleDollarSign size={36} />
                      <span>{fees.length ? 'No fee records match your query.' : 'No fee records created yet.'}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFees.map((fee) => {
                  const billed = Number(fee.amount || 0);
                  const paid = Number(fee.paidAmount || 0);
                  const balance = Math.max(0, billed - paid);

                  return (
                    <tr key={fee.id}>
                      <td>
                        <span className={tableStyles.cellPrimary}>{fee.studentName}</span>
                      </td>
                      <td>{fee.feeType}</td>
                      <td>
                        <span className={tableStyles.cellPrimary}>₹${billed.toFixed(2)}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                          ₹${paid.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: balance > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                          ₹${balance.toFixed(2)}
                        </span>
                      </td>
                      <td>{fee.dueDate}</td>
                      <td>
                        <StatusBadge status={fee.status} />
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {fee.status !== 'PAID' ? (
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: '5px 12px', fontSize: '0.82rem' }}
                              onClick={() => {
                                setActivePaymentFee(fee);
                                setPaymentAmounts((p) => ({ ...p, [fee.id]: balance.toString() }));
                              }}
                            >
                              <CreditCard size={14} />
                              <span>Record Payment</span>
                            </button>
                          ) : (
                            <span className="badge badge-success">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Fee Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Student Fee Invoice"
        maxWidth={520}
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Student *</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm((p) => ({ ...p, studentId: e.target.value }))}
              required
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} (#{s.studentNumber})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Fee Category / Head *</label>
            <input
              type="text"
              placeholder="e.g. Tuition Fee, Exam Fee, Lab Fee"
              value={form.feeType}
              onChange={(e) => setForm((p) => ({ ...p, feeType: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Amount (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Payment Due Date *</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
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
            <button type="submit" className="btn btn-primary" disabled={isSubmitting || !students.length}>
              {isSubmitting ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={Boolean(activePaymentFee)}
        onClose={() => setActivePaymentFee(null)}
        title={`Record Payment for ${activePaymentFee?.studentName}`}
        maxWidth={460}
      >
        {activePaymentFee && (
          <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-hover)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fee Head:</span>
                <span style={{ fontWeight: 600 }}>{activePaymentFee.feeType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Invoiced:</span>
                <span>₹${Number(activePaymentFee.amount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Already Paid:</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                  ₹${Number(activePaymentFee.paidAmount || 0).toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                <span style={{ fontWeight: 600 }}>Remaining Balance:</span>
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>
                  ₹${Math.max(0, Number(activePaymentFee.amount) - Number(activePaymentFee.paidAmount || 0)).toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Payment Amount (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                max={Number(activePaymentFee.amount) - Number(activePaymentFee.paidAmount || 0)}
                value={paymentAmounts[activePaymentFee.id] || ''}
                onChange={(e) =>
                  setPaymentAmounts((p) => ({ ...p, [activePaymentFee.id]: e.target.value }))
                }
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setActivePaymentFee(null)}
                disabled={isRecordingPayment}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isRecordingPayment}
              >
                {isRecordingPayment ? 'Recording...' : 'Confirm Payment'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
