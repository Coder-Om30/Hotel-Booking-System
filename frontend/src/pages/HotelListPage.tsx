import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import type { Hotel, PagedResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapPin, Star, ArrowRight, Search, Hotel as HotelIcon } from 'lucide-react';

export const HotelListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const destinationParam = searchParams.get('destination') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const rooms = searchParams.get('rooms') || '1';

  const [destinationInput, setDestinationInput] = useState(destinationParam);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const query = destinationParam ? `?destination=${encodeURIComponent(destinationParam)}` : '';
    apiRequest<PagedResponse<Hotel>>(`/api/v1/hotels${query}`)
      .then((data) => setHotels(data.content))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [destinationParam]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({
      destination: destinationInput.trim(),
      checkIn,
      checkOut,
      rooms,
    });
  };

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      {/* Header & Filter Bar */}
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          {destinationParam ? `Hotels in "${destinationParam}"` : 'All Luxury Properties'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Explore our portfolio of verified luxury hotels and boutique resorts across India.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginTop: '24px', maxWidth: '600px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <MapPin size={18} color="var(--accent-gold)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search by city (e.g. Goa, Jaipur, Mumbai)..."
              value={destinationInput}
              onChange={(e) => setDestinationInput(e.target.value)}
              style={{ paddingLeft: '42px' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Filter
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Searching available hotels..." />
      ) : hotels.length === 0 ? (
        <div className="glass-panel" style={{ padding: '64px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <HotelIcon size={48} color="var(--accent-gold)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>No Properties Found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            We couldn't find any properties matching "{destinationParam}". Try searching for Goa, Jaipur, Mumbai, or Bengaluru.
          </p>
          <button onClick={() => { setDestinationInput(''); setSearchParams({}); }} className="btn btn-secondary">
            View All Properties
          </button>
        </div>
      ) : (
        <div className="grid-3">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img
                  src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                  alt={hotel.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    {hotel.addressLine || hotel.city}
                  </span>
                  <button
                    onClick={() => {
                      const query = new URLSearchParams({
                        checkIn: checkIn || '',
                        checkOut: checkOut || '',
                        rooms: rooms || '1',
                      }).toString();
                      navigate(`/hotels/${hotel.id}?${query}`);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    View Rooms <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
