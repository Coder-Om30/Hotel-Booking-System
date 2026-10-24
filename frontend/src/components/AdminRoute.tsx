import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner text="Verifying administrator privileges..." />;
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ maxWidth: '540px', margin: '0 auto', padding: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--danger-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <ShieldAlert size={32} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>403 — Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
            Administrative privileges are required to access this portal. If you are an administrator,
            please log in using your authorized administrator account.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/" className="btn btn-secondary">
              <ArrowLeft size={16} /> Return to Home
            </Link>
            <Link to="/login" className="btn btn-primary">
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
