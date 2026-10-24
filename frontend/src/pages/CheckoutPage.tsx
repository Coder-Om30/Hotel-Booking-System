import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/apiClient';
import type { Booking, PaymentResponse, ApiError } from '../types';
import { ShieldCheck, Calendar, Clock, CreditCard, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const hotelName = searchParams.get('hotelName') || 'Luxury Stay';
  const hotelCity = searchParams.get('hotelCity') || '';
  const roomTypeId = searchParams.get('roomTypeId') || '';
  const roomTypeName = searchParams.get('roomTypeName') || 'Deluxe Room';
  const pricePerNight = parseFloat(searchParams.get('pricePerNight') || '5000');
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const roomCount = parseInt(searchParams.get('rooms') || '1', 10);
  const guestCount = parseInt(searchParams.get('guests') || '2', 10);

  // Compute stay nights & estimated total
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  const totalAmount = pricePerNight * roomCount * nights;

  // Checkout flow state
  const [currentStep, setCurrentStep] = useState<'REVIEW' | 'HOLD_CREATED' | 'PAYMENT_PENDING'>('REVIEW');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [simulationOutcome, setSimulationOutcome] = useState<'SUCCESS' | 'FAILURE' | 'CANCEL'>('SUCCESS');

  // Step 1: Create transactional booking hold
  const handleCreateHold = async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const createdBooking = await apiRequest<Booking>('/api/v1/bookings', {
        method: 'POST',
        body: JSON.stringify({
          roomTypeId: parseInt(roomTypeId, 10),
          checkIn,
          checkOut,
          roomCount,
          guestCount,
        }),
      });

      setBooking(createdBooking);
      setCurrentStep('HOLD_CREATED');
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Unable to create booking hold. The room may have been reserved by another guest.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Simulate mock payment with idempotency key
  const handleProcessPayment = async () => {
    if (!booking) return;

    setLoading(true);
    setError(null);

    try {
      const idempotencyKey = `IDEM-${booking.id}-${Date.now()}`;
      const paymentResponse = await apiRequest<PaymentResponse>(
        `/api/v1/bookings/${booking.id}/payment/mock`,
        {
          method: 'POST',
          body: JSON.stringify({
            idempotencyKey,
            outcome: simulationOutcome,
          }),
        }
      );

      if (paymentResponse.bookingStatus === 'CONFIRMED') {
        navigate(`/confirmation/${booking.bookingReference}`, {
          state: {
            booking: {
              ...booking,
              status: 'CONFIRMED',
            },
            payment: paymentResponse,
          },
        });
      } else if (paymentResponse.bookingStatus === 'CANCELLED') {
        setError('Payment hold was cancelled. Inventory has been safely released.');
      } else {
        setError('Payment simulation failed as requested. You may re-try payment before the hold expires.');
      }
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!roomTypeId || !checkIn || !checkOut) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Invalid Booking Parameters</h2>
        <p style={{ color: 'var(--text-muted)', margin: '16px 0' }}>Please select dates and room type to begin reservation.</p>
        <Link to="/hotels" className="btn btn-primary">Browse Properties</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 24px', maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>Complete Your Reservation</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '36px' }}>
        Review your reservation summary and confirm with our simulated checkout.
      </p>

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 20px',
          color: '#fca5a5',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <AlertTriangle size={20} color="#ef4444" />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
        {/* Left Column: Flow actions */}
        <div>
          {currentStep === 'REVIEW' && (
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="var(--accent-gold)" /> Step 1: Secure Inventory Hold
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '24px' }}>
                When you proceed, our backend reserves your room using row-level database locking and holds it for
                15 minutes while you review payment.
              </p>

              {!isAuthenticated ? (
                <div style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '24px',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                }}>
                  <p style={{ fontSize: '0.9rem', marginBottom: '12px' }}>
                    You must be signed in to reserve a room under your account.
                  </p>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Sign In to Continue
                  </Link>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Reserving as: <strong style={{ color: 'var(--text-main)' }}>{user?.fullName}</strong> ({user?.email})
                  </div>
                  <button
                    onClick={handleCreateHold}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '14px' }}
                  >
                    {loading ? 'Locking Inventory...' : 'Lock Inventory & Proceed to Payment'} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}

          {currentStep === 'HOLD_CREATED' && booking && (
            <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--accent-gold)' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--success-bg)',
                color: '#34d399',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 700,
                marginBottom: '16px',
              }}>
                <CheckCircle2 size={14} /> Inventory Reserved (15-Min Hold Active)
              </div>

              <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>
                Step 2: Simulate Payment
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
                Booking Ref: <strong style={{ color: 'var(--accent-gold)' }}>{booking.bookingReference}</strong>
              </p>

              {/* Safety notice */}
              <div style={{
                background: 'rgba(2, 132, 199, 0.1)',
                border: '1px solid rgba(2, 132, 199, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px',
                marginBottom: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem', marginBottom: '4px' }}>
                  <CreditCard size={16} /> MOCK PAYMENT ENVIRONMENT
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  This application strictly uses mock simulation. Never enter real credit cards. Select your desired outcome below to test the transaction engine.
                </p>
              </div>

              {/* Simulation Outcome Selector */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>Choose Simulation Scenario</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: simulationOutcome === 'SUCCESS' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${simulationOutcome === 'SUCCESS' ? '#10b981' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="outcome"
                      value="SUCCESS"
                      checked={simulationOutcome === 'SUCCESS'}
                      onChange={() => setSimulationOutcome('SUCCESS')}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#34d399' }}>Simulate Successful Payment</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Confirms booking atomically and generates reference receipt</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: simulationOutcome === 'FAILURE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${simulationOutcome === 'FAILURE' ? '#ef4444' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="outcome"
                      value="FAILURE"
                      checked={simulationOutcome === 'FAILURE'}
                      onChange={() => setSimulationOutcome('FAILURE')}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f87171' }}>Simulate Payment Failure</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Marks payment failed while retaining retry ability</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: simulationOutcome === 'CANCEL' ? 'rgba(148, 163, 184, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${simulationOutcome === 'CANCEL' ? '#94a3b8' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                  }}>
                    <input
                      type="radio"
                      name="outcome"
                      value="CANCEL"
                      checked={simulationOutcome === 'CANCEL'}
                      onChange={() => setSimulationOutcome('CANCEL')}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#cbd5e1' }}>Simulate Cancellation</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Releases reserved inventory immediately</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                onClick={handleProcessPayment}
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                {loading ? 'Processing Transaction...' : `Execute Simulated Payment (₹${totalAmount.toLocaleString('en-IN')})`}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Reservation Price Breakdown */}
        <div>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              Reservation Summary
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ fontSize: '1.15rem' }}>{hotelName}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{hotelCity}</p>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.88rem',
            }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '4px' }}>{roomTypeName}</div>
              <div style={{ color: 'var(--text-muted)' }}>{roomCount} room(s) · {guestCount} guest(s)</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} /> Check-In:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{checkIn}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={15} /> Check-Out:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{checkOut}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                <span>Duration:</span>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{nights} night(s)</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>₹{pricePerNight.toLocaleString('en-IN')} × {nights} nights × {roomCount} room(s)</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                <span>Taxes & Service Fees (Simulated):</span>
                <span>₹0.00</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: 'var(--accent-gold)',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '12px',
                marginTop: '8px',
              }}>
                <span>Total Amount:</span>
                <span>₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              color: 'var(--text-dim)',
              marginTop: '20px',
              lineHeight: 1.4,
            }}>
              <ShieldCheck size={16} color="var(--accent-gold)" /> Price snapshots are preserved permanently in database records.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
