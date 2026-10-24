import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/apiClient';
import type { Booking, PagedResponse, ApiError } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { Calendar, MapPin, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);

  const fetchBookings = () => {
    setLoading(true);
    apiRequest<PagedResponse<Booking>>('/api/v1/bookings/my?size=50')
      .then((data) => setBookings(data.content))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setActionLoading(cancellingBooking.id);
    setActionMessage(null);

    try {
      await apiRequest<Booking>(`/api/v1/bookings/${cancellingBooking.id}/cancel`, {
        method: 'POST',
      });
      setActionMessage({
        type: 'success',
        text: `Booking ref ${cancellingBooking.bookingReference} has been cancelled. Reserved inventory was released.`,
      });
      setCancellingBooking(null);
      fetchBookings();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setActionMessage({
        type: 'error',
        text: apiErr.message || 'Failed to cancel booking.',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="container" style={{ padding: '48px 24px', maxWidth: '1100px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '6px' }}>My Reservations</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Track your upcoming stays, review booking history, and manage eligible cancellations.
          </p>
        </div>

        <Link to="/hotels" className="btn btn-primary">
          Book Another Stay <ArrowRight size={16} />
        </Link>
      </div>

      {actionMessage && (
        <div style={{
          background: actionMessage.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          border: `1px solid ${actionMessage.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '14px 20px',
          color: actionMessage.type === 'success' ? '#34d399' : '#fca5a5',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.92rem',
        }}>
          {actionMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Status Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '28px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px',
        overflowX: 'auto',
      }}>
        {['ALL', 'CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED', 'EXPIRED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              background: statusFilter === tab ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: statusFilter === tab ? 'var(--accent-gold)' : 'var(--text-muted)',
              border: `1px solid ${statusFilter === tab ? 'rgba(245, 158, 11, 0.3)' : 'transparent'}`,
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {tab.toLowerCase().replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving your reservation history..." />
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '64px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <Calendar size={44} color="var(--accent-gold)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No Reservations Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {statusFilter === 'ALL'
              ? "You haven't reserved any hotel stays yet. Discover our properties to get started."
              : `You have no bookings currently in ${statusFilter.toLowerCase().replace('_', ' ')} status.`}
          </p>
          <Link to="/hotels" className="btn btn-primary">
            Explore Hotels
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredBookings.map((b) => (
            <div key={b.id} className="glass-panel" style={{
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              alignItems: 'center',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <StatusBadge status={b.status} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                    {b.bookingReference}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{b.hotelName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <MapPin size={14} color="var(--accent-gold)" /> {b.hotelCity}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Suite & Occupancy</span>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>{b.roomTypeName}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {b.roomCount} room(s) · {b.guestCount} guest(s)
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Stay Dates</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.92rem', marginTop: '2px' }}>
                  <Calendar size={14} color="var(--accent-gold)" /> {b.checkIn} → {b.checkOut}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  {b.nightCount} night(s)
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Price</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                  ₹{b.totalAmount.toLocaleString('en-IN')}
                </div>

                {b.cancellable && (
                  <button
                    onClick={() => setCancellingBooking(b)}
                    className="btn btn-danger"
                    style={{ marginTop: '10px', padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancellingBooking && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          zIndex: 100,
        }}>
          <div className="glass-panel" style={{
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            background: 'var(--bg-secondary)',
          }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '12px', color: '#f87171' }}>
              Confirm Reservation Cancellation
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '20px' }}>
              Are you sure you want to cancel your reservation for <strong>{cancellingBooking.hotelName}</strong> ({cancellingBooking.bookingReference})?
              Your held room inventory will be immediately released back to the property.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setCancellingBooking(null)}
                className="btn btn-secondary"
                disabled={actionLoading !== null}
              >
                Keep Reservation
              </button>
              <button
                onClick={handleConfirmCancel}
                className="btn btn-danger"
                disabled={actionLoading !== null}
              >
                {actionLoading !== null ? 'Releasing Room...' : 'Yes, Cancel Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
