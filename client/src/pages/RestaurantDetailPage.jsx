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
        mode: restaurant.mode || 'SEMI_AUTO',
        slotDurationMinutes: restaurant.slotDurationMinutes || 120,
        bufferMinutes: restaurant.bufferMinutes || 30,
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
    { label: 'Mode', value: restaurant.mode },
    { label: 'Slot Duration', value: `${restaurant.slotDurationMinutes} min` },
    { label: 'Buffer', value: `${restaurant.bufferMinutes} min` },
    { label: 'Max Extension', value: `${restaurant.maxExtensionMinutes} min` },
    { label: 'Warning Before', value: `${restaurant.warningBeforeMinutes} min` },
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
            {Object.entries(formData).map(([key, val]) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px' }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </label>
                <input
                  type={typeof val === 'number' ? 'number' : 'text'}
                  name={key}
                  value={val}
                  onChange={handleInputChange}
                  step={typeof val === 'number' ? '0.01' : undefined}
                  style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                />
              </div>
            ))}
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
