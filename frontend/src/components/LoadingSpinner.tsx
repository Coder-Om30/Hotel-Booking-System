import React from 'react';

export const LoadingSpinner: React.FC<{ text?: string; size?: number }> = ({
  text = 'Loading hotel data...',
  size = 40,
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      gap: '16px',
    }}>
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        border: '3px solid rgba(245, 158, 11, 0.15)',
        borderTop: '3px solid var(--accent-gold)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {text && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{text}</span>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
