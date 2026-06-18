import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRestaurants } from '../context/RestaurantContext';

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const { restaurants, loading, setSelectedRestaurantId, updateRestaurant, deleteRestaurant } = useRestaurants();
  const restaurant = restaurants.find(r => r.id === id);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (id) setSelectedRestaurantId(id);
  }, [id]);

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        address: restaurant.address || '',
        phone: restaurant.phone || '',
        taxNumber: restaurant.taxNumber || '',
        mode: restaurant.mode || 'SEMI_AUTO',
        slotDurationMinutes: restaurant.slotDurationMinutes || 120,
        bufferMinutes: restaurant.bufferMinutes || 30,
        overbookingPercentage: restaurant.overbookingPercentage || 30,
        taxRate: restaurant.taxRate || 0,
        serviceFeeRate: restaurant.serviceFeeRate || 0,
        maxExtensionMinutes: restaurant.maxExtensionMinutes || 60,
        warningBeforeMinutes: restaurant.warningBeforeMinutes || 15,
        dataRetentionDays: restaurant.dataRetentionDays || 30,
      });
    }
  }, [restaurant]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({ ...formData, [name]: type === 'number' ? parseFloat(value) : value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (formData.slotDurationMinutes < 15 || formData.slotDurationMinutes > 480) {
        return alert('Slot duration must be between 15 and 480 minutes.');
      }
      if (formData.bufferMinutes < 0 || formData.bufferMinutes > 240) {
        return alert('Buffer must be between 0 and 240 minutes.');
      }
      if (formData.maxExtensionMinutes < 0 || formData.maxExtensionMinutes > 480) {
        return alert('Max extension must be between 0 and 480 minutes.');
      }
      if (formData.warningBeforeMinutes < 0 || formData.warningBeforeMinutes > 120) {
        return alert('Warning before must be between 0 and 120 minutes.');
      }
      if (formData.taxRate < 0 || formData.taxRate > 100) {
        return alert('Tax rate must be between 0 and 100%.');
      }
      if (formData.serviceFeeRate < 0 || formData.serviceFeeRate > 100) {
        return alert('Service fee must be between 0 and 100%.');
      }
      if (formData.dataRetentionDays < 1 || formData.dataRetentionDays > 365) {
        return alert('Data retention must be between 1 and 365 days.');
      }
      if (formData.overbookingPercentage < 0 || formData.overbookingPercentage > 200) {
        return alert('Overbooking percentage must be between 0 and 200%.');
      }
      await updateRestaurant(id, formData);
      setEditing(false);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this restaurant?')) {
      try {
        await deleteRestaurant(id);
        setSelectedRestaurantId('');
      } catch (err) {
        alert('Error: ' + err.message);
      }
    }
  };

  if (!restaurant) {
    return (
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1>Restaurant not found</h1>
        <Link to="/">Back to Restaurants</Link>
      </div>
    );
  }

  const infoRows = [
    { label: 'Address', value: restaurant.address || '-' },
    { label: 'Phone', value: restaurant.phone || '-' },
    { label: 'Tax Number', value: restaurant.taxNumber || '-' },
    { label: 'Mode', value: restaurant.mode },
    { label: 'Slot Duration', value: `${restaurant.slotDurationMinutes} min` },
    { label: 'Buffer', value: `${restaurant.bufferMinutes} min` },
    { label: 'Max Extension', value: `${restaurant.maxExtensionMinutes} min` },
    { label: 'Warning Before', value: `${restaurant.warningBeforeMinutes} min` },
    { label: 'Overbooking', value: `${restaurant.overbookingPercentage || 30}%` },
    { label: 'Tax Rate', value: `${restaurant.taxRate}%` },
    { label: 'Service Fee', value: `${restaurant.serviceFeeRate}%` },
    { label: 'Data Retention', value: `${restaurant.dataRetentionDays} days` },
  ];

  const sections = [
    { label: 'Menu Items', path: '/menu-items', desc: 'Manage menu & import general menu' },
    { label: 'Tables', path: '/tables', desc: 'Manage seating layout & status' },
    { label: 'Bookings', path: '/bookings', desc: 'Manage reservations & waitlist' },
    { label: 'Walk-ins', path: '/walk-ins', desc: 'Register & manage walk-in guests' },
    { label: 'Orders', path: '/orders', desc: 'Create & manage orders' },
    { label: 'Hours', path: '/restaurant-hours', desc: 'Configure open/close/break times' },
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/" style={{ fontSize: '14px', color: '#007bff' }}>&larr; All Restaurants</Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
        <h1 style={{ margin: 0 }}>{restaurant.name}</h1>
        <button onClick={() => setEditing(!editing)} style={{ padding: '6px 16px', fontSize: '13px' }}>
          {editing ? 'Cancel' : 'Edit'}
        </button>
        <button onClick={handleDelete} style={{ padding: '6px 16px', fontSize: '13px', color: 'red' }}>
          Delete
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSave} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
          <h3>Edit Restaurant</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Tax Number (Steuernummer)</label>
              <input type="text" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Mode</label>
              <select name="mode" value={formData.mode} onChange={handleInputChange}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                <option value="SEMI_AUTO">Semi-Auto</option>
                <option value="FULL_AUTO">Full Auto</option>
              </select>
            </div>
            <div>
              <label>Slot Duration (min)</label>
              <input type="number" name="slotDurationMinutes" value={formData.slotDurationMinutes}
                onChange={handleInputChange} min="15" max="480"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Buffer (min)</label>
              <input type="number" name="bufferMinutes" value={formData.bufferMinutes}
                onChange={handleInputChange} min="0" max="240"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Max Extension (min)</label>
              <input type="number" name="maxExtensionMinutes" value={formData.maxExtensionMinutes}
                onChange={handleInputChange} min="0" max="480"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Warning Before (min)</label>
              <input type="number" name="warningBeforeMinutes" value={formData.warningBeforeMinutes}
                onChange={handleInputChange} min="0" max="120"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Overbooking (%)</label>
              <input type="number" name="overbookingPercentage" value={formData.overbookingPercentage}
                onChange={handleInputChange} min="0" max="200"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Tax Rate (%)</label>
              <input type="number" name="taxRate" value={formData.taxRate}
                onChange={handleInputChange} min="0" max="100" step="0.01"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Service Fee (%)</label>
              <input type="number" name="serviceFeeRate" value={formData.serviceFeeRate}
                onChange={handleInputChange} min="0" max="100" step="0.01"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label>Data Retention (days)</label>
              <input type="number" name="dataRetentionDays" value={formData.dataRetentionDays}
                onChange={handleInputChange} min="1" max="365"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ marginTop: '20px', padding: '10px 30px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {loading ? 'Saving...' : 'Save'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '20px', padding: '20px', border: '1px solid #e9ecef', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          {infoRows.map(row => (
            <div key={row.label}>
              <div style={{ fontSize: '12px', color: '#666' }}>{row.label}</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', marginTop: '2px' }}>{row.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '30px' }}>
        {sections.map(s => (
          <Link to={s.path} key={s.path} style={{
            display: 'block', padding: '24px', border: '1px solid #dee2e6', borderRadius: '8px',
            textDecoration: 'none', color: 'inherit', backgroundColor: '#fff',
            transition: 'box-shadow 0.2s', cursor: 'pointer'
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <h3 style={{ margin: '0 0 8px 0', color: '#007bff' }}>{s.label}</h3>
            <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
