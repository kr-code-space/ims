import React from 'react';

export function StatusBadge({ status, label }) {
  const norm = String(status || '').toUpperCase();
  let badgeClass = 'badge-primary';
  let display = label || status;

  if (['ACTIVE', 'PAID', 'PRESENT', 'AVAILABLE', 'ENABLED', 'APPROVED', 'EVALUATED'].includes(norm)) {
    badgeClass = 'badge-success';
  } else if (['PENDING', 'PARTIAL', 'MAINTENANCE', 'SUBMITTED', 'WARNING', 'LEAVE'].includes(norm)) {
    badgeClass = 'badge-warning';
  } else if (['INACTIVE', 'OVERDUE', 'ABSENT', 'DISABLED', 'REJECTED', 'LOST', 'DAMAGED', 'OUT_OF_SERVICE'].includes(norm)) {
    badgeClass = 'badge-danger';
  } else if (['IN_USE', 'ISSUED', 'CORE', 'ELECTIVE'].includes(norm)) {
    badgeClass = 'badge-primary';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {display}
    </span>
  );
}
