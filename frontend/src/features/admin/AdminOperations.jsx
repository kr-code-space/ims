import React, { useEffect, useState, useMemo } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  Plus,
  Search,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatCard } from '../../components/StatCard';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import tableStyles from '../../styles/DataTable.module.css';

export default function AdminOperations({ apiClient: propClient }) {
  const { apiClient: authClient } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('staff');
  const [staff, setStaff] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);

  const [staffForm, setStaffForm] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    department: '',
    designation: '',
  });

  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: '',
    status: 'AVAILABLE',
    location: '',
  });

  const [filter, setFilter] = useState('');

  const loadData = async () => {
    try {
      const [staffRes, facRes, auditRes] = await Promise.all([
        apiClient.get('/admin/staff'),
        apiClient.get('/admin/facilities'),
        apiClient.get('/admin/audit'),
      ]);
      setStaff(staffRes.data || []);
      setFacilities(facRes.data || []);
      setAudit(auditRes.data || []);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load operations records.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [apiClient]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/staff', { ...staffForm, active: true });
      showToast('Staff record added successfully.', 'success');
      setStaffForm({ employeeNumber: '', firstName: '', lastName: '', department: '', designation: '' });
      setStaffModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create staff record.';
      showToast(msg, 'error');
    }
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/admin/facilities', facilityForm);
      showToast('Facility record registered.', 'success');
      setFacilityForm({ name: '', type: '', status: 'AVAILABLE', location: '' });
      setFacilityModalOpen(false);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not create facility.';
      showToast(msg, 'error');
    }
  };

  const filteredStaff = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((s) =>
      [s.employeeNumber, s.firstName, s.lastName, s.department, s.designation].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [staff, filter]);

  const filteredFacilities = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return facilities;
    return facilities.filter((f) =>
      [f.name, f.type, f.location, f.status].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [facilities, filter]);

  const filteredAudit = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return audit;
    return audit.filter((a) =>
      [a.actor, a.action, a.entityType, a.details].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [audit, filter]);

  return (
    <div>
      <PageHeader
        eyebrow="Operations & Infrastructure"
        title="Staff, Facilities & Audit Log"
        description="Monitor non-teaching staff, institutional facilities, campus resources, and system security audit entries."
      >
        {activeTab === 'staff' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStaffModalOpen(true)}
          >
            <Plus size={18} />
            <span>Add Staff Member</span>
          </button>
        )}
        {activeTab === 'facilities' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setFacilityModalOpen(true)}
          >
            <Plus size={18} />
            <span>Add Facility</span>
          </button>
        )}
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '24px' }}>
        <StatCard label="Support Staff" value={staff.length} icon={Users} color="primary" subtext="Staff employees" />
        <StatCard label="Campus Facilities" value={facilities.length} icon={Building2} color="info" subtext="Halls & laboratories" />
        <StatCard label="Audit Log Entries" value={audit.length} icon={ShieldCheck} color="warning" subtext="Logged security events" />
        <StatCard label="Facility Health" value="100%" icon={Activity} color="success" subtext="Operational readiness" />
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        <button
          type="button"
          onClick={() => { setActiveTab('staff'); setFilter(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'staff' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'staff' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'staff' ? 600 : 500,
            fontSize: '0.88rem',
            border: '1px solid',
            borderColor: activeTab === 'staff' ? 'var(--primary)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <Users size={16} />
          <span>Staff Members ({staff.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('facilities'); setFilter(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'facilities' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'facilities' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'facilities' ? 600 : 500,
            fontSize: '0.88rem',
            border: '1px solid',
            borderColor: activeTab === 'facilities' ? 'var(--primary)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <Building2 size={16} />
          <span>Campus Facilities ({facilities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('audit'); setFilter(''); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: activeTab === 'audit' ? 'var(--primary-light)' : 'transparent',
            color: activeTab === 'audit' ? 'var(--primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'audit' ? 600 : 500,
            fontSize: '0.88rem',
            border: '1px solid',
            borderColor: activeTab === 'audit' ? 'var(--primary)' : 'transparent',
            cursor: 'pointer',
          }}
        >
          <ShieldCheck size={16} />
          <span>Security Audit Trail ({audit.length})</span>
        </button>
      </div>

      <div className={tableStyles.container}>
        <div className={tableStyles.toolbar}>
          <div className={tableStyles.summary}>
            <span className={tableStyles.summaryTitle}>
              {activeTab === 'staff' ? 'Support Staff Register' : activeTab === 'facilities' ? 'Infrastructure Directory' : 'System Event Logs'}
            </span>
          </div>

          <div className={tableStyles.searchWrapper}>
            <Search size={16} className={tableStyles.searchIcon} />
            <input
              type="text"
              className={tableStyles.searchInput}
              placeholder="Filter records..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        <div className={tableStyles.tableWrap}>
          <table className={tableStyles.table}>
            {activeTab === 'staff' && (
              <>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className={tableStyles.emptyState}>Loading staff records...</td></tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr><td colSpan={4} className={tableStyles.emptyState}>No staff records found.</td></tr>
                  ) : (
                    filteredStaff.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <span className={tableStyles.cellPrimary}>{s.firstName} {s.lastName}</span>
                          <span className={tableStyles.cellSecondary}>#{s.employeeNumber}</span>
                        </td>
                        <td>{s.department}</td>
                        <td><span className={tableStyles.cellPrimary}>{s.designation}</span></td>
                        <td><StatusBadge status={s.active ? 'ACTIVE' : 'INACTIVE'} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}

            {activeTab === 'facilities' && (
              <>
                <thead>
                  <tr>
                    <th>Facility Name</th>
                    <th>Type</th>
                    <th>Location / Room</th>
                    <th>Current Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className={tableStyles.emptyState}>Loading campus facilities...</td></tr>
                  ) : filteredFacilities.length === 0 ? (
                    <tr><td colSpan={4} className={tableStyles.emptyState}>No facilities registered yet.</td></tr>
                  ) : (
                    filteredFacilities.map((f) => (
                      <tr key={f.id}>
                        <td><span className={tableStyles.cellPrimary}>{f.name}</span></td>
                        <td><span className="badge badge-primary">{f.type}</span></td>
                        <td>{f.location || '-'}</td>
                        <td><StatusBadge status={f.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}

            {activeTab === 'audit' && (
              <>
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Actor / User</th>
                    <th>Entity Type</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className={tableStyles.emptyState}>Loading audit events...</td></tr>
                  ) : filteredAudit.length === 0 ? (
                    <tr><td colSpan={4} className={tableStyles.emptyState}>No audit log events recorded yet.</td></tr>
                  ) : (
                    filteredAudit.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <span className="badge badge-primary">{a.action}</span>
                          {a.details && <span className={tableStyles.cellSecondary}>{a.details}</span>}
                        </td>
                        <td>
                          <span className={tableStyles.cellPrimary}>@{a.actor}</span>
                        </td>
                        <td>{a.entityType} {a.entityId ? `#${a.entityId}` : ''}</td>
                        <td>
                          <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                            {a.occurredAt ? new Date(a.occurredAt).toLocaleString() : '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>

      {/* Staff Modal */}
      <Modal
        isOpen={staffModalOpen}
        onClose={() => setStaffModalOpen(false)}
        title="Register Staff Member"
        maxWidth={500}
      >
        <form onSubmit={handleCreateStaff} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Employee Number *</label>
            <input
              type="text"
              placeholder="e.g. STF-201"
              value={staffForm.employeeNumber}
              onChange={(e) => setStaffForm((p) => ({ ...p, employeeNumber: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>First Name *</label>
              <input
                type="text"
                value={staffForm.firstName}
                onChange={(e) => setStaffForm((p) => ({ ...p, firstName: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Last Name *</label>
              <input
                type="text"
                value={staffForm.lastName}
                onChange={(e) => setStaffForm((p) => ({ ...p, lastName: e.target.value }))}
                required
              />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Department *</label>
            <input
              type="text"
              placeholder="e.g. Administration, Facilities, IT Support"
              value={staffForm.department}
              onChange={(e) => setStaffForm((p) => ({ ...p, department: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Designation *</label>
            <input
              type="text"
              placeholder="e.g. Campus Officer, Technician"
              value={staffForm.designation}
              onChange={(e) => setStaffForm((p) => ({ ...p, designation: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setStaffModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Staff</button>
          </div>
        </form>
      </Modal>

      {/* Facility Modal */}
      <Modal
        isOpen={facilityModalOpen}
        onClose={() => setFacilityModalOpen(false)}
        title="Register Campus Facility"
        maxWidth={500}
      >
        <form onSubmit={handleCreateFacility} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Facility Name *</label>
            <input
              type="text"
              placeholder="e.g. Physics Lab A, Auditorium"
              value={facilityForm.name}
              onChange={(e) => setFacilityForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Facility Type *</label>
              <input
                type="text"
                placeholder="e.g. Laboratory, Lecture Hall"
                value={facilityForm.type}
                onChange={(e) => setFacilityForm((p) => ({ ...p, type: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Status</label>
              <select
                value={facilityForm.status}
                onChange={(e) => setFacilityForm((p) => ({ ...p, status: e.target.value }))}
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="IN_USE">IN_USE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 600 }}>Location / Building</label>
            <input
              type="text"
              placeholder="e.g. Block B, 2nd Floor, Room 204"
              value={facilityForm.location}
              onChange={(e) => setFacilityForm((p) => ({ ...p, location: e.target.value }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFacilityModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Register Facility</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
