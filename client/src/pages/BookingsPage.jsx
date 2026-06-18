import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '../context/BookingContext';
import { useTables } from '../context/TableContext';
import { useRestaurants } from '../context/RestaurantContext';
import { bookingService } from '../services/bookingService';

export default function BookingsPage() {
  const { bookings, loading, error, fetchBookingsByRestaurant, createBooking, updateBooking, seatCustomer, completeBooking, deleteBooking, removeBookingTable, addBookingTable } = useBookings();
  const { tables, fetchTablesByRestaurant } = useTables();
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [formData, setFormData] = useState({
    tableIds: [],
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 2,
    scheduledStart: '',
  });

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchBookingsByRestaurant(selectedRestaurantId);
      fetchTablesByRestaurant(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTableToggle = (tableId) => {
    const current = formData.tableIds;
    if (current.includes(tableId)) {
      setFormData({ ...formData, tableIds: current.filter(id => id !== tableId) });
    } else {
      setFormData({ ...formData, tableIds: [...current, tableId] });
    }
  };

  const handleSubmit = async (e, confirmedOverbook = false) => {
    if (e) e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerEmail)) {
      alert('Please enter a valid email address.');
      return;
    }
    try {
      const payload = { ...formData, restaurantId: selectedRestaurantId };
      if (confirmedOverbook) {
        payload.confirmedOverbook = true;
      }
      if (editingId) {
        const { tableIds, ...bookingData } = payload;
        await updateBooking(editingId, bookingData);
        resetForm();
      } else {
        const result = await bookingService.create(payload);
        if (result.requiresConfirmation) {
          if (confirm(result.message)) {
            return handleSubmit(null, true);
          }
          return;
        }
        fetchBookingsByRestaurant(selectedRestaurantId);
        resetForm();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (booking) => {
    setFormData({
      tableIds: (booking.tables || []).map(t => t.tableId),
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      partySize: booking.partySize,
      scheduledStart: booking.scheduledStart,
    });
    setEditingId(booking.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteBooking(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleSeat = async (id) => {
    try {
      await seatCustomer(id);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleComplete = async (id) => {
    if (confirm('Mark this booking as completed?')) {
      try {
        await completeBooking(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateBooking(id, { status: newStatus });
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleRemoveTable = async (bookingId, tableId) => {
    try {
      await removeBookingTable(bookingId, tableId);
      fetchBookingsByRestaurant(selectedRestaurantId);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleAddTable = async (bookingId) => {
    const tableId = prompt('Enter Table ID to add to this booking:');
    if (tableId) {
      try {
        await addBookingTable(bookingId, tableId);
        fetchBookingsByRestaurant(selectedRestaurantId);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      tableIds: [],
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      partySize: 2,
      scheduledStart: '',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#6c757d',
      CONFIRMED: '#17a2b8',
      SEATED: '#28a745',
      COMPLETED: '#6c757d',
      CANCELLED: '#dc3545',
      NO_SHOW: '#dc3545',
      WAITLISTED: '#ffc107',
    };
    return colors[status] || '#6c757d';
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const filteredBookings = filterDate
    ? bookings.filter(b => {
        const bookingDate = new Date(b.scheduledStart).toISOString().split('T')[0];
        return bookingDate === filterDate;
      })
    : bookings;

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
        <h1>Bookings Management</h1>
        <p>Select a restaurant from the navigation bar to manage bookings.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Bookings — {selectedRestaurant?.name}</h1>
      <Link to={`/restaurants/${selectedRestaurantId}`} style={{ fontSize: '14px', color: '#007bff', display: 'block', marginBottom: '12px' }}>&larr; Back to Restaurant</Link>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
          {showForm ? 'Cancel' : 'Add Booking'}
        </button>
        <input type="date" value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)} style={{ padding: '8px' }} />
        {filterDate && (
          <button onClick={() => setFilterDate('')} style={{ padding: '8px' }}>Clear Filter</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px'
        }}>
          <h2>{editingId ? 'Edit Booking' : 'Add New Booking'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Customer Name *</label>
              <input type="text" name="customerName" value={formData.customerName}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label>Party Size *</label>
              <input type="number" name="partySize" value={formData.partySize}
                onChange={handleInputChange} min="1" required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label>Phone</label>
              <input type="tel" name="customerPhone" value={formData.customerPhone}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label>Email *</label>
              <input type="email" name="customerEmail" value={formData.customerEmail}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
            <div>
              <label>Scheduled Start *</label>
              <input type="datetime-local" name="scheduledStart" value={formData.scheduledStart}
                onChange={handleInputChange} required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ fontWeight: 'bold' }}>Assigned Tables</label>
            {tables.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                {tables.map(table => (
                  <label key={table.id} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px',
                    cursor: 'pointer', backgroundColor: formData.tableIds.includes(table.id) ? '#007bff' : '#fff',
                    color: formData.tableIds.includes(table.id) ? '#fff' : '#000'
                  }}>
                    <input type="checkbox" checked={formData.tableIds.includes(table.id)}
                      onChange={() => handleTableToggle(table.id)} style={{ display: 'none' }} />
                    {table.name || table.id} ({table.seats} seats)
                  </label>
                ))}
              </div>
            ) : (
              <p style={{ color: '#666', marginTop: '8px' }}>No tables found for this restaurant.</p>
            )}
          </div>

          <button type="submit" disabled={loading} style={{
            marginTop: '20px', padding: '10px 30px', backgroundColor: '#007bff',
            color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : filteredBookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Party</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Date/Time</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Tables</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <div><strong>{booking.customerName}</strong></div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{booking.customerPhone}</div>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>{booking.partySize}</td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <div style={{ fontSize: '13px' }}>{formatDateTime(booking.scheduledStart)}</div>
                  {booking.isOverbooked && (
                    <span style={{ fontSize: '11px', backgroundColor: '#ffc107', padding: '2px 6px', borderRadius: '3px', color: 'black' }}>
                      WAITLISTED
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <select value={booking.status}
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    style={{ padding: '4px 8px', borderRadius: '4px',
                      backgroundColor: getStatusColor(booking.status), color: 'white', border: 'none', cursor: 'pointer' }}>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="SEATED">Seated</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="NO_SHOW">No Show</option>
                    <option value="WAITLISTED">Waitlisted</option>
                  </select>
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {(booking.tables || []).length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(booking.tables || []).map(t => (
                        <span key={t.id} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '2px 8px', backgroundColor: '#e9ecef', borderRadius: '4px', fontSize: '12px'
                        }}>
                          {(() => { const t2 = tables.find(x => x.id === t.tableId); return t2 ? t2.name : t.tableId; })()}
                          <button onClick={() => handleRemoveTable(booking.id, t.tableId)}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545', padding: '0', fontSize: '14px', lineHeight: '1' }}
                            title="Remove table">&times;</button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>No tables assigned</span>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {booking.status === 'PENDING' && (
                    <button onClick={() => handleSeat(booking.id)} style={{ marginRight: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                      Seat
                    </button>
                  )}
                  {booking.status === 'SEATED' && (
                    <button onClick={() => handleComplete(booking.id)} style={{ marginRight: '5px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                      Complete
                    </button>
                  )}
                  <button onClick={() => handleAddTable(booking.id)} style={{ marginRight: '5px', backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }} title="Add Table">
                    +Table
                  </button>
                  <button onClick={() => handleEdit(booking)} style={{ marginRight: '5px', padding: '4px 8px', cursor: 'pointer' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(booking.id)} style={{ color: 'red', padding: '4px 8px', cursor: 'pointer' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
