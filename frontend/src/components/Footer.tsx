import React from 'react';
import { Hotel, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.95)',
      padding: '48px 0 32px',
      marginTop: '80px',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '36px',
          marginBottom: '40px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Hotel size={18} color="#090d16" />
              </div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 800 }}>
                AuraStay
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
              A modern, enterprise-grade hotel reservation platform featuring real-time date availability,
              concurrency-controlled inventory locking, and simulated transactions.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              <li><a href="/" style={{ transition: 'color 0.2s' }}>Discover Stays</a></li>
              <li><a href="/hotels" style={{ transition: 'color 0.2s' }}>Explore All Properties</a></li>
              <li><a href="/my-bookings" style={{ transition: 'color 0.2s' }}>Manage Reservations</a></li>
              <li><a href="/admin" style={{ transition: 'color 0.2s' }}>Property Administration</a></li>
            </ul>
          </div>

          <div>
            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', marginBottom: '8px' }}>
                <ShieldAlert size={18} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  Educational Simulation
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                This is a portfolio project with simulated mock payments. Real credit card details or bank credentials
                must never be entered.
              </p>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          color: 'var(--text-dim)',
          fontSize: '0.82rem',
        }}>
          <div>
            © {new Date().getFullYear()} AuraStay Hotel Booking System. Built with Java, Spring Boot, MySQL & React.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
