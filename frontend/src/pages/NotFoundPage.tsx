import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
      <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '48px 32px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--accent-gold-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <Compass size={32} color="var(--accent-gold)" />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '12px' }}>404 — Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.6 }}>
          The page or destination you are searching for does not exist or has been relocated.
        </p>
        <Link to="/" className="btn btn-primary">
          <Home size={16} /> Return to Home
        </Link>
      </div>
    </div>
  );
};
