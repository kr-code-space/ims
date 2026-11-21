import React, { useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { ToastContext } from './ToastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px',
        }}
      >
        {toasts.map((toast) => {
          let border = 'var(--primary)';
          let IconComponent = Info;
          let iconColor = 'var(--primary)';

          if (toast.type === 'success') {
            border = 'var(--success)';
            IconComponent = CheckCircle2;
            iconColor = 'var(--success)';
          } else if (toast.type === 'error') {
            border = 'var(--danger)';
            IconComponent = AlertOctagon;
            iconColor = 'var(--danger)';
          } else if (toast.type === 'warning') {
            border = 'var(--warning)';
            IconComponent = AlertTriangle;
            iconColor = 'var(--warning)';
          }

          return (
            <div
              key={toast.id}
              role="alert"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderLeft: `4px solid ${border}`,
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                borderLeftColor: border,
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                color: 'var(--text-primary)',
                animation: 'slideIn 0.2s ease-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <IconComponent size={18} style={{ color: iconColor, flexShrink: 0 }} />
                <span style={{ fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.4 }}>
                  {toast.message}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
                style={{
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                }}
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
