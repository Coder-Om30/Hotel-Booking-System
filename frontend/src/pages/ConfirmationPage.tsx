import React from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, Calendar, MapPin, CreditCard, ArrowRight, Home } from 'lucide-react';
import type { Booking, PaymentResponse } from '../types';

export const ConfirmationPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const location = useLocation();

  const state = location.state as { booking?: Booking; payment?: PaymentResponse } | undefined;
  const booking = state?.booking;
  const payment = state?.payment;

  return (
    <div className="container" style={{ padding: '64px 24px', maxWidth: '780px' }}>
      <div className="glass-panel" style={{ padding: '48px 36px', textAlign: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--success-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 30px rgba(16, 185, 129, 0.25)',
        }}>
          <CheckCircle2 size={40} color="#10b981" />
        </div>

        <span style={{
          color: 'var(--accent-gold)',
          fontSize: '0.85rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Reservation Confirmed
        </span>
        <h1 style={{ fontSize: '2.4rem', margin: '8px 0 16px' }}>Thank You for Your Booking!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto 32px' }}>
          Your reservation has been confirmed and locked into the property schedule. A simulation receipt has been generated.
        </p>

        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          textAlign: 'left',
          marginBottom: '36px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Booking Reference</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {reference || booking?.bookingReference || 'BK-CONFIRMED'}
              </div>
            </div>

            {payment && (
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Simulation TX ID</span>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CreditCard size={15} /> {payment.paymentReference}
                </div>
              </div>
            )}
          </div>

          {booking && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Property</span>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '2px' }}>{booking.hotelName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} color="var(--accent-gold)" /> {booking.hotelCity}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Room Suite</span>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', marginTop: '2px' }}>{booking.roomTypeName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {booking.roomCount} Room(s) · {booking.guestCount} Guest(s)
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Dates</span>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--accent-gold)" /> {booking.checkIn} → {booking.checkOut}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {booking.nightCount} Night(s)
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Paid</span>
                <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--accent-gold)', marginTop: '2px' }}>
                  ₹{booking.totalAmount.toLocaleString('en-IN')}
                </div>
                <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>Simulated Paid</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/my-bookings" className="btn btn-primary">
            View My Bookings <ArrowRight size={16} />
          </Link>
          <Link to="/" className="btn btn-secondary">
            <Home size={16} /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
