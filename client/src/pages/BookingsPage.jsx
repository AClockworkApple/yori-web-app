import { useState, useEffect } from 'react';
import { useBookings } from '../context/BookingContext';

export default function BookingsPage() {
  const { bookings, loading, error, fetchBookings, createBooking, updateBooking, seatCustomer, completeBooking, deleteBooking } = useBookings();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [formData, setFormData] = useState({
    restaurantId: '',
    tableId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 2,
    scheduledStart: '',
    scheduledEnd: '',
    isOverbooked: false,
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateBooking(editingId, formData);
      } else {
        await createBooking(formData);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (booking) => {
    setFormData({
      restaurantId: booking.restaurantId,
      tableId: booking.tableId || '',
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerEmail: booking.customerEmail,
      partySize: booking.partySize,
      scheduledStart: booking.scheduledStart,
      scheduledEnd: booking.scheduledEnd,
      isOverbooked: booking.isOverbooked,
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
    const tableId = prompt('Enter Table ID to seat this customer:');
    if (tableId) {
      try {
        await seatCustomer(id, tableId);
      } catch (err) {
        alert('Error: ' + err.message);
      }
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

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      restaurantId: '',
      tableId: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      partySize: 2,
      scheduledStart: '',
      scheduledEnd: '',
      isOverbooked: false,
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

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>Bookings Management</h1>
      
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '10px 20px' }}>
          {showForm ? 'Cancel' : 'Add Booking'}
        </button>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ padding: '8px' }}
        />
        {filterDate && (
          <button onClick={() => setFilterDate('')} style={{ padding: '8px' }}>
            Clear Filter
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ 
          border: '1px solid #ccc', 
          padding: '20px', 
          marginBottom: '20px',
          borderRadius: '8px'
        }}>
          <h2>{editingId ? 'Edit Booking' : 'Add New Booking'}</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Restaurant ID *</label>
              <input
                type="text"
                name="restaurantId"
                value={formData.restaurantId}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Party Size *</label>
              <input
                type="number"
                name="partySize"
                value={formData.partySize}
                onChange={handleInputChange}
                min="1"
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Customer Name *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Phone *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Email *</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Scheduled Start *</label>
              <input
                type="datetime-local"
                name="scheduledStart"
                value={formData.scheduledStart}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div>
              <label>Scheduled End *</label>
              <input
                type="datetime-local"
                name="scheduledEnd"
                value={formData.scheduledEnd}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginTop: '25px' }}>
              <input
                type="checkbox"
                name="isOverbooked"
                checked={formData.isOverbooked}
                onChange={handleInputChange}
                style={{ marginRight: '10px' }}
              />
              <label>Waitlisted (Overbooked)</label>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ 
            marginTop: '20px', 
            padding: '10px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
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
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          marginTop: '20px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Customer</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Party</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Date/Time</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Table</th>
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
                    <span style={{ 
                      fontSize: '11px', 
                      backgroundColor: '#ffc107', 
                      padding: '2px 6px', 
                      borderRadius: '3px',
                      color: 'black'
                    }}>
                      WAITLISTED
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  <select
                    value={booking.status}
                    onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: getStatusColor(booking.status),
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
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
                  {booking.tableId || '-'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>
                  {booking.status === 'PENDING' && (
                    <button onClick={() => handleSeat(booking.id)} style={{ marginRight: '5px' }}>
                      Seat
                    </button>
                  )}
                  {booking.status === 'SEATED' && (
                    <button onClick={() => handleComplete(booking.id)} style={{ marginRight: '5px', backgroundColor: '#28a745', color: 'white' }}>
                      Complete
                    </button>
                  )}
                  <button onClick={() => handleEdit(booking)} style={{ marginRight: '5px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(booking.id)} style={{ color: 'red' }}>
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