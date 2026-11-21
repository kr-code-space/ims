import React, { useEffect, useState, useMemo } from 'react';
import {
  CircleDollarSign,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

export default function StudentFees({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    apiClient.get('/student/fees')
      .then((res) => {
        if (!isCurrent) return;
        setFees(res.data || []);
      })
      .catch((err) => {
        if (!isCurrent) return;
        const msg = err.response?.data?.message || 'Could not load your fee records.';
        showToast(msg, 'error');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [apiClient]);

  const stats = useMemo(() => {
    let total = 0;
    let paid = 0;
    fees.forEach((f) => {
      total += Number(f.amount || 0);
      paid += Number(f.paidAmount || 0);
    });
    const outstanding = Math.max(0, total - paid);
    return { total, paid, outstanding };
  }, [fees]);

  return (
    <div>
      <PageHeader
        eyebrow="Financial Records"
        title="Tuition Fees & Invoices"
        description="Inspect semester fee dues, paid receipts, payment deadlines, and outstanding fee obligations."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Total Invoiced"
          value={`₹${stats.total.toFixed(2)}`}
          icon={Receipt}
          color="primary"
          subtext="All semester fees"
        />
        <StatCard
          label="Total Paid"
          value={`₹${stats.paid.toFixed(2)}`}
          icon={CheckCircle2}
          color="success"
          subtext="Cleared payments"
        />
        <StatCard
          label="Outstanding Dues"
          value={`₹${stats.outstanding.toFixed(2)}`}
          icon={AlertCircle}
          color={stats.outstanding > 0 ? 'warning' : 'success'}
          subtext={stats.outstanding > 0 ? 'Payment required' : 'All fees cleared'}
        />
      </div>

      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>Fee Statement & Receipts</span>
            <span className={tableStyles.summaryCount}>
              {fees.length} invoice record{fees.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Fee Head / Description</th>
                <th>Total Invoiced</th>
                <th>Paid Amount</th>
                <th>Balance Outstanding</th>
                <th>Payment Due Date</th>
                <th>Settlement Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Loading fee records...</span>
                    </div>
                  </td>
                </tr>
              ) : fees.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className={tableStyles.emptyState}>
                      <CircleDollarSign size={36} />
                      <span>No fee records found for your student account.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                fees.map((fee) => {
                  const billed = Number(fee.amount || 0);
                  const paid = Number(fee.paidAmount || 0);
                  const balance = Math.max(0, billed - paid);

                  return (
                    <tr key={fee.id}>
                      <td>
                        <span className={tableStyles.cellPrimary}>{fee.feeType}</span>
                      </td>
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
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                          <span>{fee.dueDate}</span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={fee.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
