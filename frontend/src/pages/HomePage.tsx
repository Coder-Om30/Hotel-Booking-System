import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import type { Hotel, PagedResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Search form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrow.toISOString().split('T')[0]);
  const [guests, setGuests] = useState('2');
  const [rooms, setRooms] = useState('1');
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    apiRequest<PagedResponse<Hotel>>('/api/v1/hotels?size=6')
      .then((data) => setHotels(data.content))
      .catch((err) => console.error('Failed to load hotels:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError('Check-out date must be after check-in date');
      return;
    }
    setDateError('');
    const params = new URLSearchParams({
      destination: destination.trim(),
      checkIn,
      checkOut,
      guests,
      rooms,
    });
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '80px 0 100px',
        background: 'radial-gradient(ellipse at top, rgba(245, 158, 11, 0.12) 0%, rgba(9, 13, 22, 1) 75%)',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center', marginBottom: '40px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-full)',
              color: 'var(--accent-gold)',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '20px',
            }}>
              <Award size={16} /> Handcrafted Luxury Experiences
            </span>
            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.15,
              fontWeight: 800,
              marginBottom: '20px',
            }}>
              Discover Extraordinary Stays,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Curated for Elegance.
              </span>
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Reserve exclusive hotel suites with real-time date availability, guaranteed pricing snapshots,
              and seamless simulated payments.
            </p>
          </div>

          {/* Search Widget */}
          <div className="glass-panel" style={{
            maxWidth: '1050px',
            margin: '0 auto',
            padding: '28px',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
          }}>
            <form onSubmit={handleSearch} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '16px',
              alignItems: 'flex-end',
            }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--accent-gold)" /> Destination
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Goa, Jaipur, Mumbai..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--accent-gold)" /> Check-In
                </label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} color="var(--accent-gold)" /> Check-Out
                </label>
                <input
                  type="date"
                  className="form-input"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={14} color="var(--accent-gold)" /> Guests & Rooms
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="form-select"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                  </select>
                  <select
                    className="form-select"
                    value={rooms}
                    onChange={(e) => setRooms(e.target.value)}
                  >
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                  </select>
                </div>
              </div>

              <div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px' }}>
                  <Search size={18} /> Search Stays
                </button>
              </div>
            </form>

            {dateError && (
              <div style={{
                color: '#f87171',
                fontSize: '0.85rem',
                marginTop: '12px',
                textAlign: 'center',
                fontWeight: 600,
              }}>
                {dateError}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section style={{ padding: '36px 0', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center' }}>
              <ShieldCheck size={28} color="var(--accent-gold)" />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Zero Overbooking Guarantee</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Row-level concurrency inventory locking</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center' }}>
              <Clock size={28} color="var(--accent-gold)" />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>15-Min Protected Hold</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Room held while completing checkout</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', justifyContent: 'center' }}>
              <Award size={28} color="var(--accent-gold)" />
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Free Cancellation</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Cancel up to 24h prior to check-in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <span style={{
                color: 'var(--accent-gold)',
                fontSize: '0.85rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Premier Destinations
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: '4px' }}>Featured Luxury Properties</h2>
            </div>
            <button
              onClick={() => navigate('/hotels')}
              className="btn btn-secondary"
            >
              Browse All Properties <ArrowRight size={16} />
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading featured luxury hotels..." />
          ) : (
            <div className="grid-3">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                    <img
                      src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                      alt={hotel.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: 'rgba(9, 13, 22, 0.75)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#fbbf24',
                    }}>
                      <Star size={14} fill="#fbbf24" color="#fbbf24" /> {hotel.starRating || 5}.0
                    </div>
                  </div>

                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      marginBottom: '8px',
                    }}>
                      <MapPin size={14} color="var(--accent-gold)" /> {hotel.city}, {hotel.country}
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>{hotel.name}</h3>

                    <p style={{
                      color: 'var(--text-muted)',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      marginBottom: '20px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1,
                    }}>
                      {hotel.description}
                    </p>

                    <div style={{
                      borderTop: '1px solid var(--border-subtle)',
                      paddingTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                          Starting from
                        </span>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                          ₹4,800 <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ night</span>
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/hotels/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}`)}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        Select Rooms <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
