import React, { useEffect, useState } from 'react';
import {
  Building,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { useToast } from '../../components/useToast';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge } from '../../components/StatusBadge';

export default function StudentProfile({ apiClient: propClient }) {
  const { apiClient: authClient, user } = useAuth();
  const apiClient = propClient || authClient;
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    apiClient.get('/student/profile')
      .then((res) => {
        if (!isCurrent) return;
        setProfile(res.data);
      })
      .catch((err) => {
        if (!isCurrent) return;
        const msg = err.response?.data?.message || 'Could not load your student profile.';
        showToast(msg, 'error');
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [apiClient]);

  const initial = profile?.firstName ? profile.firstName.charAt(0).toUpperCase() : 'S';

  return (
    <div>
      <PageHeader
        eyebrow="Identity & Records"
        title="Student Profile"
        description="Official institutional student identification, enrolled department, academic cohort, and portal account details."
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid var(--border-color)', borderTop: '2px solid var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <span style={{ color: 'var(--text-muted)' }}>Loading student profile...</span>
        </div>
      ) : profile ? (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
          {/* Identity Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px 24px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.2rem',
                fontWeight: 700,
                border: '3px solid var(--border-color)',
              }}
            >
              {initial}
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-primary)' }}>
                {profile.firstName} {profile.lastName}
              </h2>
              <span className="badge badge-primary" style={{ marginTop: '8px' }}>
                Roll #{profile.studentNumber}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.86rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Standing:</span>
                <StatusBadge status={profile.active ? 'ACTIVE' : 'INACTIVE'} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.86rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Portal User:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>@{profile.accountUsername || user?.username}</span>
              </div>
            </div>
          </div>

          {/* Academic Details Card */}
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                Academic & Departmental Enrollment
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                Verified records registered in PostgreSQL by Institute Administration.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ padding: '10px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                  <Building size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Department
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                    {profile.department}
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ padding: '10px', backgroundColor: 'var(--info-bg)', color: 'var(--info)', borderRadius: 'var(--radius-md)' }}>
                  <Calendar size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Academic Year
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                    {profile.year}
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ padding: '10px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', borderRadius: 'var(--radius-md)' }}>
                  <Layers size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Class Section
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                    {profile.className}
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div style={{ padding: '10px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning)', borderRadius: 'var(--radius-md)' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Student Record Status
                  </span>
                  <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                    {profile.active ? 'Active & Enrolled' : 'Inactive / Suspended'}
                  </p>
                </div>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                color: 'var(--text-muted)',
              }}
            >
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span>Official institutional verification status confirmed by Registrar's office.</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          No student profile found for this account.
        </div>
      )}
    </div>
  );
}
