import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

export default function FacultyLab({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: '',
    serialNumber: '',
    status: 'AVAILABLE',
    maintenanceNotes: '',
  });

  const loadEquipment = async () => {
    try {
      const res = await apiClient.get('/faculty/lab-access');
      setEquipment(res.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'LAB_ACCESS authority required to view equipment.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEquipment();
  }, [apiClient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/faculty/lab-access/equipment', form);
      showToast('Lab equipment item recorded.', 'success');
      setForm({ name: '', serialNumber: '', status: 'AVAILABLE', maintenanceNotes: '' });
      setModalOpen(false);
      await loadEquipment();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not save equipment record.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredEquipment = equipment.filter((item) =>
    [item.name, item.serialNumber, item.status, item.maintenanceNotes].some((v) =>
      v?.toLowerCase().includes(filter.trim().toLowerCase())
    )
  );

  return (
    <div>
      <PageHeader
        eyebrow="Facilities & Hardware"
        title="Laboratory Inventory & Access"
        description="Inspect registered experimental laboratory equipment, track hardware status, and log maintenance details."
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={18} />
          <span>Add Equipment</span>
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard
          label="Total Units"
          value={equipment.length}
          icon={ShieldCheck}
          color="primary"
          subtext="Lab inventory items"
        />
        <StatCard
          label="Available"
          value={equipment.filter((e) => e.status === 'AVAILABLE').length}
          icon={CheckCircle2}
          color="success"
          subtext="Ready for practicals"
        />
        <StatCard
          label="Maintenance / Repair"
          value={equipment.filter((e) => e.status === 'MAINTENANCE').length}
          icon={Wrench}
          color="warning"
          subtext="Under inspection"
        />
      </div>

      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>Equipment Inventory</span>
            <span className={tableStyles.summaryCount}>
              Showing {filteredEquipment.length} of {equipment.length} items
            </span>
          </div>

          <div className={tableStyles.searchWrapper}>
            <Search size={16} className={tableStyles.searchIcon} />
            <input
              type="text"
              className={tableStyles.searchInput}
              placeholder="Search by name, serial no, status..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Serial / Identifier</th>
                <th>Operational Status</th>
                <th>Maintenance Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Loading lab inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEquipment.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className={tableStyles.emptyState}>
                      <ShieldCheck size={36} />
                      <span>No laboratory equipment found. Click "Add Equipment" to register units.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEquipment.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={tableStyles.cellPrimary}>{item.name}</span>
                    </td>
                    <td>
                      <span className="badge badge-primary">{item.serialNumber}</span>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td>
                      <span style={{ color: item.maintenanceNotes ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                        {item.maintenanceNotes || 'None'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Laboratory Equipment"
        maxWidth={500}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Equipment Name *</label>
            <input
              type="text"
              placeholder="e.g. Digital Oscilloscope 100MHz"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Serial Number *</label>
              <input
                type="text"
                placeholder="e.g. SN-88231"
                value={form.serialNumber}
                onChange={(e) => setForm((p) => ({ ...p, serialNumber: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="IN_USE">IN_USE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Maintenance / Usage Notes</label>
            <input
              type="text"
              placeholder="e.g. Calibrated on 15 Oct, bench 4"
              value={form.maintenanceNotes}
              onChange={(e) => setForm((p) => ({ ...p, maintenanceNotes: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Add Equipment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
