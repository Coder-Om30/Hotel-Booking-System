import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/apiClient';
import type { Hotel, RoomType, AvailabilityResponse } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapPin, Star, Calendar, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export const HotelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [availabilities, setAvailabilities] = useState<Record<number, AvailabilityResponse>>({});
  const [loading, setLoading] = useState(true);

  // Date selection state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || dayAfterTomorrow.toISOString().split('T')[0]);
  const [rooms, setRooms] = useState(searchParams.get('rooms') || '1');
  const [guests, setGuests] = useState('2');

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      apiRequest<Hotel>(`/api/v1/hotels/${id}`),
      apiRequest<RoomType[]>(`/api/v1/hotels/${id}/room-types`),
    ])
      .then(([hotelData, roomData]) => {
        setHotel(hotelData);
        setRoomTypes(roomData);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Query live availability for all room types whenever dates or rooms change
  useEffect(() => {
    if (roomTypes.length === 0 || !checkIn || !checkOut) return;
    if (new Date(checkOut) <= new Date(checkIn)) return;

    roomTypes.forEach((rt) => {
      apiRequest<AvailabilityResponse>(
        `/api/v1/availability?roomTypeId=${rt.id}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=${rooms}`
      )
        .then((avail) => {
          setAvailabilities((prev) => ({ ...prev, [rt.id]: avail }));
        })
        .catch((err) => console.error('Availability check failed:', err));
    });
  }, [roomTypes, checkIn, checkOut, rooms]);

  if (loading) {
    return <LoadingSpinner text="Loading property details and room options..." />;
  }

  if (!hotel) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Hotel Not Found</h2>
        <button onClick={() => navigate('/hotels')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Hotels
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Property Hero Banner */}
      <div style={{
        position: 'relative',
        height: '420px',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <img
          src={hotel.imageUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80'}
          alt={hotel.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(9, 13, 22, 1) 0%, rgba(9, 13, 22, 0.4) 60%, rgba(9, 13, 22, 0.2) 100%)',
        }} />
        <div className="container" style={{
          position: 'absolute',
          bottom: '36px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-gold)',
              fontSize: '0.9rem',
              fontWeight: 700,
              marginBottom: '8px',
            }}>
              <Star size={16} fill="var(--accent-gold)" /> {hotel.starRating}.0 Star Luxury Property
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', marginBottom: '8px' }}>{hotel.name}</h1>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <MapPin size={16} color="var(--accent-gold)" />
              {hotel.addressLine ? `${hotel.addressLine}, ` : ''}{hotel.city}, {hotel.stateRegion ? `${hotel.stateRegion}, ` : ''}{hotel.country}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: '48px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: '40px' }}>
          {/* Left Column: Description & Available Rooms */}
          <div>
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '14px' }}>About This Property</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.98rem' }}>
                {hotel.description}
              </p>
              <div style={{
                marginTop: '24px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  <ShieldCheck size={18} color="var(--accent-gold)" /> Instant Confirmation
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  <Check size={18} color="#10b981" /> Free Cancellation 24h Prior
                </div>
              </div>
            </div>

            {/* Room Types Showcase */}
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '20px' }}>Available Room Suites</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {roomTypes.map((room) => {
                  const avail = availabilities[room.id];
                  const isAvailable = avail ? avail.available : true;
                  const availableRoomsCount = avail ? avail.availableRooms : room.totalRooms;

                  return (
                    <div key={room.id} className="glass-panel" style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      overflow: 'hidden',
                    }}>
                      <div style={{ height: '220px', position: 'relative' }}>
                        <img
                          src={room.imageUrl || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'}
                          alt={room.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          left: '10px',
                          background: 'rgba(9, 13, 22, 0.8)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: 'var(--accent-gold)',
                        }}>
                          Max {room.maxOccupancy} Guests / Room
                        </div>
                      </div>

                      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>{room.name}</h3>
                          </div>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '14px', lineHeight: 1.5 }}>
                            {room.description}
                          </p>

                          {room.amenities && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                              {room.amenities.split(',').map((amenity, i) => (
                                <span key={i} style={{
                                  fontSize: '0.75rem',
                                  padding: '3px 8px',
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  borderRadius: 'var(--radius-sm)',
                                  color: 'var(--text-muted)',
                                }}>
                                  {amenity.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={{
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                        }}>
                          <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                              ₹{room.pricePerNight.toLocaleString('en-IN')}{' '}
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ night</span>
                            </div>
                            <span style={{
                              fontSize: '0.8rem',
                              color: isAvailable ? '#34d399' : '#f87171',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}>
                              {isAvailable ? (
                                <>
                                  <Check size={14} /> {availableRoomsCount} room(s) available
                                </>
                              ) : (
                                <>
                                  <AlertCircle size={14} /> Sold out for dates
                                </>
                              )}
                            </span>
                          </div>

                          <button
                            disabled={!isAvailable}
                            onClick={() => {
                              const checkoutParams = new URLSearchParams({
                                hotelId: hotel.id.toString(),
                                hotelName: hotel.name,
                                hotelCity: hotel.city,
                                roomTypeId: room.id.toString(),
                                roomTypeName: room.name,
                                pricePerNight: room.pricePerNight.toString(),
                                checkIn,
                                checkOut,
                                rooms,
                                guests,
                              });
                              navigate(`/checkout?${checkoutParams.toString()}`);
                            }}
                            className="btn btn-primary"
                          >
                            {isAvailable ? 'Reserve Suite' : 'Unavailable'} <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Date & Room Selector Widget */}
          <div>
            <div className="glass-panel" style={{
              position: 'sticky',
              top: '90px',
              padding: '28px',
            }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="var(--accent-gold)" /> Check Stay Availability
              </h3>

              <div className="form-group">
                <label className="form-label">Check-In Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Check-Out Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={checkIn}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Rooms</label>
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
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Guests</label>
                  <select
                    className="form-select"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="6">6 Guests</option>
                  </select>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                marginTop: '16px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: 600, marginBottom: '4px' }}>
                  <ShieldCheck size={16} /> Live Real-Time Availability
                </div>
                Room rates and dates automatically recalculate live inventory using database row-level locking.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
