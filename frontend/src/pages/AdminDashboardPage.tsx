import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/apiClient';
import type { Hotel, RoomType, Booking, PagedResponse, ApiError } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { Shield, Hotel as HotelIcon, BedDouble, Calendar, Plus, CheckCircle2, AlertTriangle, IndianRupee } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HOTELS' | 'ROOMS' | 'RESERVATIONS'>('HOTELS');

  // Hotels state
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [showAddHotelModal, setShowAddHotelModal] = useState(false);
  const [newHotel, setNewHotel] = useState({
    name: '',
    city: '',
    country: 'India',
    addressLine: '',
    stateRegion: '',
    description: '',
    starRating: 5,
    imageUrl: '',
  });

  // Room Types state
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: '',
    description: '',
    maxOccupancy: 2,
    totalRooms: 10,
    pricePerNight: 5000,
    imageUrl: '',
    amenities: 'King Bed, Free WiFi, Air Conditioning, City View',
  });

  // Reservations state
  const [reservations, setReservations] = useState<Booking[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [reservationFilter, setReservationFilter] = useState('');

  // Notifications
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch all hotels
  const fetchHotels = () => {
    setLoadingHotels(true);
    apiRequest<PagedResponse<Hotel>>('/api/v1/admin/hotels?size=100')
      .then((data) => {
        setHotels(data.content);
        if (data.content.length > 0 && selectedHotelId === null) {
          setSelectedHotelId(data.content[0].id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingHotels(false));
  };

  // Fetch room types for selected hotel
  const fetchRoomTypes = (hotelId: number) => {
    setLoadingRooms(true);
    apiRequest<RoomType[]>(`/api/v1/admin/hotels/${hotelId}/room-types`)
      .then((data) => setRoomTypes(data))
      .catch((err) => console.error(err))
      .finally(() => setLoadingRooms(false));
  };

  // Fetch all reservations
  const fetchReservations = (status = '') => {
    setLoadingReservations(true);
    const query = status ? `?status=${status}&size=100` : '?size=100';
    apiRequest<PagedResponse<Booking>>(`/api/v1/admin/bookings${query}`)
      .then((data) => setReservations(data.content))
      .catch((err) => console.error(err))
      .finally(() => setLoadingReservations(false));
  };

  useEffect(() => {
    fetchHotels();
    fetchReservations();
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      fetchRoomTypes(selectedHotelId);
    }
  }, [selectedHotelId]);

  // Handle hotel creation
  const handleCreateHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest<Hotel>('/api/v1/admin/hotels', {
        method: 'POST',
        body: JSON.stringify(newHotel),
      });
      setNotification({ type: 'success', message: 'New hotel property listed successfully!' });
      setShowAddHotelModal(false);
      setNewHotel({
        name: '',
        city: '',
        country: 'India',
        addressLine: '',
        stateRegion: '',
        description: '',
        starRating: 5,
        imageUrl: '',
      });
      fetchHotels();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setNotification({ type: 'error', message: apiErr.message || 'Failed to create hotel' });
    }
  };

  // Handle hotel status toggle
  const handleToggleHotelStatus = async (hotelId: number, currentActive: boolean) => {
    try {
      await apiRequest<Hotel>(`/api/v1/admin/hotels/${hotelId}/status?active=${!currentActive}`, {
        method: 'PATCH',
      });
      setNotification({ type: 'success', message: `Hotel status updated to ${!currentActive ? 'ACTIVE' : 'INACTIVE'}` });
      fetchHotels();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setNotification({ type: 'error', message: apiErr.message || 'Failed to update hotel status' });
    }
  };

  // Handle room type creation
  const handleCreateRoomType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelId) return;

    try {
      await apiRequest<RoomType>(`/api/v1/admin/hotels/${selectedHotelId}/room-types`, {
        method: 'POST',
        body: JSON.stringify(newRoom),
      });
      setNotification({ type: 'success', message: 'Room suite added successfully!' });
      setShowAddRoomModal(false);
      fetchRoomTypes(selectedHotelId);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setNotification({ type: 'error', message: apiErr.message || 'Failed to add room type' });
    }
  };

  // Handle reservation status update
  const handleUpdateReservationStatus = async (bookingId: number, newStatus: string) => {
    try {
      await apiRequest<Booking>(`/api/v1/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          notes: 'Updated via Admin Control Portal',
        }),
      });
      setNotification({ type: 'success', message: `Reservation status changed to ${newStatus}` });
      fetchReservations(reservationFilter);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setNotification({ type: 'error', message: apiErr.message || 'Status transition rejected' });
    }
  };

  // Metrics calculation
  const totalRevenue = reservations
    .filter((r) => r.status === 'CONFIRMED')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="container" style={{ padding: '48px 24px', maxWidth: '1280px' }}>
      {/* Admin Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', marginBottom: '4px' }}>
            <Shield size={18} />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              System Administration
            </span>
          </div>
          <h1 style={{ fontSize: '2.2rem' }}>Property & Reservation Portal</h1>
        </div>

        {activeTab === 'HOTELS' && (
          <button onClick={() => setShowAddHotelModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add New Hotel
          </button>
        )}
        {activeTab === 'ROOMS' && (
          <button onClick={() => setShowAddRoomModal(true)} className="btn btn-primary">
            <Plus size={16} /> Add Room Suite
          </button>
        )}
      </div>

      {notification && (
        <div style={{
          background: notification.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
          border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '14px 20px',
          color: notification.type === 'success' ? '#34d399' : '#fca5a5',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Metrics Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '36px',
      }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Properties</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)' }}>
            {hotels.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Reservations</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#38bdf8' }}>
            {reservations.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Confirmed Bookings</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: '#34d399' }}>
            {reservations.filter((r) => r.status === 'CONFIRMED').length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Confirmed Revenue</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center' }}>
            <IndianRupee size={22} /> {totalRevenue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '28px',
        paddingBottom: '12px',
      }}>
        <button
          onClick={() => setActiveTab('HOTELS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'HOTELS' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'HOTELS' ? 'var(--accent-gold)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'HOTELS' ? 'rgba(245, 158, 11, 0.3)' : 'transparent'}`,
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <HotelIcon size={18} /> Hotel Properties
        </button>

        <button
          onClick={() => setActiveTab('ROOMS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'ROOMS' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'ROOMS' ? 'var(--accent-gold)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'ROOMS' ? 'rgba(245, 158, 11, 0.3)' : 'transparent'}`,
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <BedDouble size={18} /> Room Inventory & Rates
        </button>

        <button
          onClick={() => setActiveTab('RESERVATIONS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            background: activeTab === 'RESERVATIONS' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            color: activeTab === 'RESERVATIONS' ? 'var(--accent-gold)' : 'var(--text-muted)',
            border: `1px solid ${activeTab === 'RESERVATIONS' ? 'rgba(245, 158, 11, 0.3)' : 'transparent'}`,
            fontSize: '0.92rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Calendar size={18} /> All Reservations
        </button>
      </div>

      {/* TAB 1: HOTELS */}
      {activeTab === 'HOTELS' && (
        <div>
          {loadingHotels ? (
            <LoadingSpinner text="Loading property listings..." />
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Property Name</th>
                    <th>Destination</th>
                    <th>Rating</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map((h) => (
                    <tr key={h.id}>
                      <td style={{ color: 'var(--text-dim)', fontWeight: 600 }}>#{h.id}</td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{h.name}</strong>
                      </td>
                      <td>{h.city}, {h.country}</td>
                      <td style={{ color: 'var(--accent-gold)' }}>★ {h.starRating}.0</td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: h.active ? 'var(--success-bg)' : 'rgba(239, 68, 68, 0.15)',
                          color: h.active ? '#34d399' : '#f87171',
                        }}>
                          {h.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleHotelStatus(h.id, h.active)}
                          className={h.active ? 'btn btn-secondary' : 'btn btn-primary'}
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                        >
                          {h.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROOM TYPES */}
      {activeTab === 'ROOMS' && (
        <div>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Select Hotel Property:</label>
            <select
              className="form-select"
              style={{ maxWidth: '360px' }}
              value={selectedHotelId || ''}
              onChange={(e) => setSelectedHotelId(parseInt(e.target.value, 10))}
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>{h.name} ({h.city})</option>
              ))}
            </select>
          </div>

          {loadingRooms ? (
            <LoadingSpinner text="Loading room types..." />
          ) : roomTypes.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
              <BedDouble size={36} color="var(--accent-gold)" style={{ margin: '0 auto 12px' }} />
              <h3>No Room Suites Defined</h3>
              <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>
                Add the first room suite and rate for this hotel property.
              </p>
              <button onClick={() => setShowAddRoomModal(true)} className="btn btn-primary">
                <Plus size={16} /> Add Room Suite
              </button>
            </div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Suite Name</th>
                    <th>Max Occupancy</th>
                    <th>Total Inventory</th>
                    <th>Rate / Night</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {roomTypes.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{r.amenities}</div>
                      </td>
                      <td>{r.maxOccupancy} Guests</td>
                      <td>
                        <strong style={{ color: '#38bdf8' }}>{r.totalRooms} Rooms</strong>
                      </td>
                      <td style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>
                        ₹{r.pricePerNight.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: r.active ? 'var(--success-bg)' : 'rgba(239, 68, 68, 0.15)',
                          color: r.active ? '#34d399' : '#f87171',
                        }}>
                          {r.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL RESERVATIONS */}
      {activeTab === 'RESERVATIONS' && (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {['', 'CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED', 'EXPIRED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setReservationFilter(st);
                  fetchReservations(st);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: reservationFilter === st ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: reservationFilter === st ? 'var(--accent-gold)' : 'var(--text-muted)',
                  border: `1px solid ${reservationFilter === st ? 'rgba(245, 158, 11, 0.3)' : 'transparent'}`,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {st ? st.toLowerCase().replace('_', ' ') : 'All Bookings'}
              </button>
            ))}
          </div>

          {loadingReservations ? (
            <LoadingSpinner text="Loading system reservations..." />
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Customer</th>
                    <th>Hotel & Suite</th>
                    <th>Dates</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Admin Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((b) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                        {b.bookingReference}
                      </td>
                      <td>
                        <div>{b.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.customerEmail}</div>
                      </td>
                      <td>
                        <div>{b.hotelName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.roomTypeName} ({b.roomCount} room)</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {b.checkIn} → {b.checkOut} ({b.nightCount}n)
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <StatusBadge status={b.status} />
                      </td>
                      <td>
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(b.id, 'CANCELLED')}
                            className="btn btn-danger"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Cancel
                          </button>
                        )}
                        {b.status === 'PENDING_PAYMENT' && (
                          <button
                            onClick={() => handleUpdateReservationStatus(b.id, 'CONFIRMED')}
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Hotel Modal */}
      {showAddHotelModal && (
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
            maxWidth: '560px',
            width: '100%',
            padding: '32px',
            background: 'var(--bg-secondary)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Add New Hotel Property</h3>
            <form onSubmit={handleCreateHotel}>
              <div className="form-group">
                <label className="form-label">Property Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newHotel.name}
                  onChange={(e) => setNewHotel({ ...newHotel, name: e.target.value })}
                  placeholder="e.g. Royal Bengal Heritage Resort"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newHotel.city}
                    onChange={(e) => setNewHotel({ ...newHotel, city: e.target.value })}
                    placeholder="e.g. Kolkata"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={newHotel.country}
                    onChange={(e) => setNewHotel({ ...newHotel, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address Line</label>
                <input
                  type="text"
                  className="form-input"
                  value={newHotel.addressLine}
                  onChange={(e) => setNewHotel({ ...newHotel, addressLine: e.target.value })}
                  placeholder="Street / locality"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image URL (Unsplash or direct image)</label>
                <input
                  type="url"
                  className="form-input"
                  value={newHotel.imageUrl}
                  onChange={(e) => setNewHotel({ ...newHotel, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={newHotel.description}
                  onChange={(e) => setNewHotel({ ...newHotel, description: e.target.value })}
                  placeholder="Highlight key luxury offerings, location advantages, and guest amenities."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddHotelModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Property
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Room Type Modal */}
      {showAddRoomModal && (
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
            maxWidth: '540px',
            width: '100%',
            padding: '32px',
            background: 'var(--bg-secondary)',
          }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Add Room Suite</h3>
            <form onSubmit={handleCreateRoomType}>
              <div className="form-group">
                <label className="form-label">Suite Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newRoom.name}
                  onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                  placeholder="e.g. Royal Maharaja Suite"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Max Occupancy</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={newRoom.maxOccupancy}
                    onChange={(e) => setNewRoom({ ...newRoom, maxOccupancy: parseInt(e.target.value, 10) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Total Rooms</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={newRoom.totalRooms}
                    onChange={(e) => setNewRoom({ ...newRoom, totalRooms: parseInt(e.target.value, 10) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rate / Night (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    className="form-input"
                    value={newRoom.pricePerNight}
                    onChange={(e) => setNewRoom({ ...newRoom, pricePerNight: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={newRoom.amenities}
                  onChange={(e) => setNewRoom({ ...newRoom, amenities: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Suite Photo URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={newRoom.imageUrl}
                  onChange={(e) => setNewRoom({ ...newRoom, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setShowAddRoomModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Suite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
