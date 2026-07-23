import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurantHours } from '../context/RestaurantHourContext';
import { useRestaurants } from '../context/RestaurantContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RestaurantHoursPage() {
  const { hours, loading, error, fetchHoursByRestaurant, createHour, updateHour, deleteHour } = useRestaurantHours();
  const { selectedRestaurantId, selectedRestaurant } = useRestaurants();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    dayOfWeek: 0,
    openTime: '08:00',
    closeTime: '21:00',
    breakStart: '12:00',
    breakEnd: '16:00',
  });

  useEffect(() => {
    if (selectedRestaurantId) {
      fetchHoursByRestaurant(selectedRestaurantId);
    }
  }, [selectedRestaurantId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        dayOfWeek: parseInt(formData.dayOfWeek),
        restaurantId: selectedRestaurantId,
      };
      if (editingId) {
        await updateHour(editingId, payload);
      } else {
        await createHour(payload);
      }
      resetForm();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleEdit = (hour) => {
    setFormData({
      dayOfWeek: hour.dayOfWeek,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      breakStart: hour.breakStart || '',
      breakEnd: hour.breakEnd || '',
    });
    setEditingId(hour.id);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this hour entry?')) {
      try {
        await deleteHour(id);
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      dayOfWeek: 0,
      openTime: '08:00',
      closeTime: '21:00',
      breakStart: '12:00',
      breakEnd: '16:00',
    });
  };

  const hoursByDay = {};
  DAYS.forEach((_, i) => { hoursByDay[i] = null; });
  hours.forEach(h => { hoursByDay[h.dayOfWeek] = h; });

  if (!selectedRestaurantId) {
    return (
      <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Restaurant Hours</h1>
        <p>Select a restaurant from the navigation bar to manage hours.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Restaurant Hours — {selectedRestaurant?.name}</h1>
      <Link to={`/restaurants/${selectedRestaurantId}`} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '12px' }}>&larr; Back to Restaurant</Link>

      {error && <p style={{ color: '#ff6b6b' }}>Error: {error}</p>}

      <form onSubmit={handleSubmit} style={{
        border: '1px solid rgba(255,255,255,0.08)', padding: '20px', marginBottom: '20px', borderRadius: '8px'
      }}>
        <h2>{editingId ? 'Edit Hours' : 'Add Hours'}</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.5)' }}>Day of Week *</label>
            <select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleInputChange} required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}>
              {DAYS.map((day, i) => (
                <option key={i} value={i} disabled={!!hoursByDay[i] && hoursByDay[i].id !== editingId}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.5)' }}>Open Time *</label>
            <input type="time" name="openTime" value={formData.openTime} onChange={handleInputChange} required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.5)' }}>Close Time *</label>
            <input type="time" name="closeTime" value={formData.closeTime} onChange={handleInputChange} required
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.5)' }}>Break Start</label>
            <input type="time" name="breakStart" value={formData.breakStart} onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div>
            <label style={{ color: 'rgba(255,255,255,0.5)' }}>Break End</label>
            <input type="time" name="breakEnd" value={formData.breakEnd} onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          marginTop: '20px', padding: '10px 30px', backgroundColor: 'rgba(255,215,0,0.15)',
          color: '#ffd700', border: 'none', borderRadius: '4px', cursor: 'pointer'
        }}>
          {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
        </button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{
            marginTop: '20px', marginLeft: '10px', padding: '10px 30px',
            backgroundColor: 'rgba(108,117,125,0.25)', color: 'rgba(255,255,255,0.5)', border: 'none', borderRadius: '4px', cursor: 'pointer'
          }}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : hours.length === 0 ? (
        <p>No hours set for this restaurant. Add hours to get started.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Day</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Open</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Close</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Break</th>
              <th style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, i) => {
              const hour = hoursByDay[i];
              return (
                <tr key={i} style={{ backgroundColor: hour ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', fontWeight: hour ? 'bold' : 'normal' }}>
                    {day}
                  </td>
                  {hour ? (
                    <>
                      <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>{hour.openTime}</td>
                      <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>{hour.closeTime}</td>
                      <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {hour.breakStart && hour.breakEnd ? `${hour.breakStart} - ${hour.breakEnd}` : '-'}
                      </td>
                      <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <button onClick={() => handleEdit(hour)} style={{ marginRight: '5px' }}>Edit</button>
                        <button onClick={() => handleDelete(hour.id)} style={{ color: '#ff6b6b' }}>Delete</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#999' }}>-</td>
                      <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#999' }}>-</td>
                      <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)', color: '#999' }}>-</td>
                      <td style={{ padding: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <button onClick={() => setFormData({ ...formData, dayOfWeek: i })} style={{ fontSize: '12px' }}>Add</button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
